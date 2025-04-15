import {
  CreateKeyCommand,
  GetPublicKeyCommand,
  KMSClient,
} from '@aws-sdk/client-kms';
import { logger } from './logger';

const kmsClient = new KMSClient({
  region: process.env.REGION,
  retryMode: 'standard',
  maxAttempts: 10,
});

export async function createKmsKey(input: CreateKeyCommand): Promise<string> {
  const result = await kmsClient.send(input);

  if (!result.KeyMetadata?.KeyId) {
    logger.error(result);
    throw new Error('Failed to create key');
  }
  return result.KeyMetadata?.KeyId;
}

export async function getKmsPublicKey(keyId: string): Promise<Uint8Array | undefined> {
  const keyArn = `arn:aws:kms:${process.env.REGION}:${process.env.ACCOUNT_ID}:key/${keyId}`;
  logger.info(keyArn);

  const result = await kmsClient.send(
    new GetPublicKeyCommand({
      KeyId: keyArn,
    })
  );

  if (!result.PublicKey) {
    logger.warn(`PublicKey not found ${keyArn}`);
  }
  logger.info(result.PublicKey);
  return result.PublicKey;
}
