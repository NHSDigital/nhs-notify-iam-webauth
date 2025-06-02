/* eslint-disable no-await-in-loop */
import {
  DescribeKeyCommand,
  GetPublicKeyCommand,
  KMSClient,
  KeyState,
  ListKeysCommand,
  ListKeysCommandOutput,
  ListResourceTagsCommand,
  ScheduleKeyDeletionCommand,
  Tag,
} from '@aws-sdk/client-kms';
import { logger } from 'helpers/logger';
import { batchPromises, poll, sleep } from 'helpers/async-util';

const kmsClient = new KMSClient({
  region: process.env.REGION,
  retryMode: 'standard',
  maxAttempts: 10,
});

async function getKeyState(
  keyId: string
): Promise<{ keyId: string; state: KeyState | undefined }> {
  const keyDetails = await kmsClient
    .send(
      new DescribeKeyCommand({
        KeyId: keyId,
      })
    )
    .catch(() => {});
  return { keyId, state: keyDetails?.KeyMetadata?.KeyState };
}

async function listAllEnabledKeyIds(): Promise<string[]> {
  let truncated = false;
  let marker;
  const allKeyIds: string[] = [];
  do {
    const keysBatch: ListKeysCommandOutput = await kmsClient.send(
      new ListKeysCommand({
        Limit: 1000,
        Marker: marker,
      })
    );

    truncated = keysBatch.Truncated || false;
    marker = keysBatch.NextMarker;

    for (const key of keysBatch.Keys || []) {
      if (key.KeyId) allKeyIds.push(key.KeyId);
    }
  } while (truncated);

  const keyStates = await batchPromises(
    allKeyIds.map((keyId) => () => getKeyState(keyId)),
    5
  );

  return keyStates
    .filter((state) => state.state === KeyState.Enabled)
    .map((state) => state.keyId);
}

async function getKeyTags(
  keyId: string
): Promise<{ keyId: string; tags: Record<string, string> }> {
  const tags: Tag[] = await kmsClient
    .send(
      new ListResourceTagsCommand({
        KeyId: keyId,
      })
    )
    .then((response) => response.Tags || [])
    .catch((error) => {
      if (error.__type === 'AccessDeniedException') {
        return [];
      }
      throw error;
    });

  const tagMap: Record<string, string> = {};

  for (const tag of tags) {
    const key = tag.TagKey || 'unknown';
    const value = tag.TagValue || '';
    // eslint-disable-next-line security/detect-object-injection
    tagMap[key] = value;
  }

  return { keyId, tags: tagMap };
}

async function deleteKey(keyId: string): Promise<void> {
  logger.info(`Deleting key ${keyId}`);

  await kmsClient
    .send(
      new ScheduleKeyDeletionCommand({
        KeyId: keyId,
        PendingWindowInDays: 7,
      })
    )
    .catch((error) => {
      if (error.__type === 'KMSInvalidStateException') {
        return;
      }
      throw error;
    });
}

export async function getKmsPublicKey(
  keyId: string
): Promise<Uint8Array | undefined> {
  const keyArn = `arn:aws:kms:${process.env.REGION}:${process.env.ACCOUNT_ID}:key/${keyId}`;

  const result = await kmsClient.send(
    new GetPublicKeyCommand({
      KeyId: keyArn,
    })
  );

  if (!result.PublicKey) {
    logger.warn(`PublicKey not found ${keyArn}`);
  }
  return result.PublicKey;
}

function createPublicKeyRetriever(
  keyId: string
): () => Promise<{ keyId: string; publicKey: Uint8Array | undefined }> {
  return () =>
    getKmsPublicKey(keyId)
      .then((pk) => ({ keyId, publicKey: pk }))
      .catch(() => ({ keyId, publicKey: undefined }));
}

export async function deleteAllKeysForTags(
  name: string,
  group: string,
  usage: string
): Promise<void> {
  if (!name.endsWith('-sbx')) {
    throw new Error(`Should only be deleting keys from a sandbox: ${name}`);
  }

  logger.info(
    `Looking for keys to delete using tags Name: ${name}, Group: ${group}, Usage: ${usage}`
  );

  const allKeyIds = await listAllEnabledKeyIds();
  const taggedKeys = await batchPromises(
    allKeyIds.map((keyId) => () => getKeyTags(keyId)),
    5
  );

  const keysToDelete = taggedKeys
    .filter((keyMetadata) => keyMetadata.tags.Name === name)
    .filter((keyMetadata) => keyMetadata.tags.Group === group)
    .filter((keyMetadata) => keyMetadata.tags.Usage === usage)
    .map((keyMetadata) => keyMetadata.keyId);

  logger.info(`About to delete ${keysToDelete.length} keys`);
  await batchPromises(
    keysToDelete.map((keyId) => () => deleteKey(keyId)),
    5
  );

  // Wait until all key states have been updated
  let keysRemaining = [...keysToDelete];

  // KMS uses an eventual consistency model - wait until the public keys are no longer available
  await sleep(500);
  const deletedKeyCheck: (attemptNumber: number) => Promise<boolean> = async (
    attemptNumber
  ) => {
    const publicKeys = await batchPromises(
      keysRemaining.map((keyId) => createPublicKeyRetriever(keyId)),
      5
    );

    if (attemptNumber > 1) {
      logger.warn(
        `attemptNumber: ${attemptNumber}, publicKeys: ${JSON.stringify(publicKeys)}`
      );
    }

    keysRemaining = publicKeys
      .filter((keyState) => !!keyState.publicKey)
      .map((keyState) => keyState.keyId);
    return keysRemaining.length === 0;
  };
  await poll(2000, deletedKeyCheck);
}
