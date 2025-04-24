import { CreateKeyCommand, KeySpec, KeyUsageType } from '@aws-sdk/client-kms';
import { getKeyTags } from '@/src/utils/aws/tag-util';
import { createKmsKey, getKmsPublicKey } from '@/src/utils/aws/kms-util';
import { getParameter } from '@/src/utils/aws/ssm-util';
import { logger } from '@/src/utils/logger';
import { KMS_NO_OP_ERRORS } from '@/src/utils/constants';

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
  const publicKey = await getKmsPublicKey(keyId).catch((error) => {
    if (KMS_NO_OP_ERRORS.some((errorType) => error instanceof errorType)) {
      logger.warn(`Key not found: ${keyId}`);
      return;
    }
    throw error;
  });

  return { keyId, publicKey: publicKey as Uint8Array | undefined };
}
