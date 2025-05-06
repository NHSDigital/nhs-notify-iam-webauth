import {
  KMSClient,
  ListKeysCommand,
  ListKeysCommandOutput,
  ListResourceTagsCommand,
  ScheduleKeyDeletionCommand,
  Tag,
} from '@aws-sdk/client-kms';
import { logger } from './logger';

const kmsClient = new KMSClient({
  region: process.env.REGION,
  retryMode: 'standard',
  maxAttempts: 10,
});

async function listAllKeyIds(): Promise<Array<string>> {
  let truncated = false;
  let marker;
  const allKeyIds: Array<string> = [];
  do {
    const keysBatch: ListKeysCommandOutput = await kmsClient.send(
      new ListKeysCommand({
        Limit: 1000,
        Marker: marker,
      })
    );

    truncated = keysBatch.Truncated || false;
    marker = keysBatch.NextMarker;

    keysBatch.Keys?.map((key) => key.KeyId || '')
      .filter((keyId) => !!keyId)
      .forEach((keyId) => allKeyIds.push(keyId));
  } while (truncated);

  return allKeyIds;
}

async function getKeyTags(
  keyId: string
): Promise<{ keyId: string; tags: Record<string, string> }> {
  const tags: Array<Tag> = await kmsClient
    .send(
      new ListResourceTagsCommand({
        KeyId: keyId,
      })
    )
    .then((response) => response.Tags || [])
    .catch((error) => {
      if (error['__type'] === 'AccessDeniedException') {
        return [];
      }
      throw error;
    });

  const tagMap = tags.reduce(
    (acc, tag) => {
      const key = tag.TagKey || 'unknown';
      const value = tag.TagValue || '';
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string>
  );
  return { keyId, tags: tagMap };
}

async function deleteKey(keyId: string): Promise<void> {
  logger.info(`Deleting key ${keyId}`);

  await kmsClient.send(
    new ScheduleKeyDeletionCommand({
      KeyId: keyId,
    })
  );
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

  const allKeyIds = await listAllKeyIds();
  const taggedKeys = await Promise.all(
    allKeyIds.map((keyId) => getKeyTags(keyId))
  );

  const keysToDelete = taggedKeys
    .filter((keyMetadata) => keyMetadata.tags['Name'] === name)
    .filter((keyMetadata) => keyMetadata.tags['Group'] === group)
    .filter((keyMetadata) => keyMetadata.tags['Usage'] === usage)
    .map((keyMetadata) => keyMetadata.keyId);

  logger.info(`About to delete ${keysToDelete.length} keys`);
  await Promise.all(keysToDelete.map((keyId) => deleteKey(keyId)));
}
