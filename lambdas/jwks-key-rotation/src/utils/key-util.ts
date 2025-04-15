import {
  CreateKeyCommand,
  KeySpec,
  KeyUsageType,
  NotFoundException,
} from '@aws-sdk/client-kms';
import { getKeyTags } from './aws-utils';
import { createKmsKey, getKmsPublicKey } from './kms-util';
import { getParameter } from './ssm-util';
import { logger } from './logger';

async function getKeyPolicy(): Promise<string> {
  const ssmResult = await getParameter(process.env.SSM_ASYMMETRIC_KEY_POLICY);
  if (!ssmResult.Parameter?.Value) {
    throw new Error(
      `Failed to retrieve key policy from ${process.env.SSM_ASYMMETRIC_KEY_POLICY}`
    );
  }
  return ssmResult.Parameter.Value;
}

export async function generateKey(): Promise<string> {
  const keyPolicy = await getKeyPolicy();
  const keyTags = getKeyTags();

  const keyId = await createKmsKey(
    new CreateKeyCommand({
      Policy: keyPolicy,
      Description: 'Used for JWKS auth for CIS2 login',
      KeyUsage: KeyUsageType.SIGN_VERIFY,
      KeySpec: KeySpec.RSA_4096,
      Tags: keyTags,
    })
  );

  return keyId;
}

export async function getPublicKey(
  keyId: string
): Promise<{ keyId: string; publicKey?: Uint8Array }> {
  const publicKey = await getKmsPublicKey(keyId).catch((err) => {
    if (err instanceof NotFoundException) {
      logger.warn(`Key not found: ${keyId}`);
      return undefined;
    }
    throw err;
  });

  return { keyId, publicKey };
}
