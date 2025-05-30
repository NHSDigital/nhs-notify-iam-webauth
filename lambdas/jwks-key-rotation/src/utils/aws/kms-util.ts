import {
  CreateKeyCommand,
  DescribeKeyCommand,
  GetPublicKeyCommand,
  KMSClient,
  KeyState,
  ScheduleKeyDeletionCommand,
} from '@aws-sdk/client-kms';
import { logger } from '@/src/utils/logger';
import { KMS_NO_OP_ERRORS } from '../constants';

const kmsClient = new KMSClient({
  region: process.env.REGION,
  retryMode: 'standard',
  maxAttempts: 10,
});

export async function createKmsKey(input: CreateKeyCommand): Promise<string> {
  const result = await kmsClient.send(input);
  const keyId = result.KeyMetadata?.KeyId;

  if (!keyId) {
    logger.error(result);
    throw new Error('Failed to create key');
  }

  logger.info(`Created key ${keyId}`);
  return keyId;
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

export async function deleteKey(keyId: string): Promise<void> {
  logger.info(`Deleting key ${keyId}`);

  await kmsClient.send(
    new ScheduleKeyDeletionCommand({
      KeyId: keyId,
    })
  );
}

export async function getKeyState(
  keyId: string
): Promise<{ keyId: string; keyState: KeyState }> {
  const keyState = await kmsClient
    .send(new DescribeKeyCommand({ KeyId: keyId }))
    .then((result) => result.KeyMetadata?.KeyState ?? KeyState.Unavailable)
    .catch((error) => {
      if (KMS_NO_OP_ERRORS.some((errorType) => error instanceof errorType)) {
        logger.warn(`Key not found: ${keyId}`);
        return KeyState.Unavailable;
      }
      throw error;
    });
  return { keyId, keyState };
}
