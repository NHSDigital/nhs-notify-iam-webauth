import { KMSClient, SignCommand } from '@aws-sdk/client-kms';

const kmsClient = new KMSClient({
  region: process.env.REGION,
  retryMode: 'standard',
  maxAttempts: 10,
});

const SIGNING_ALGORITHM = 'RSASSA_PKCS1_V1_5_SHA_512';

export async function getPayloadSignature(
  keyId: string,
  unsignedMessage: string
): Promise<string> {
  const result = await kmsClient.send(
    new SignCommand({
      KeyId: keyId,
      Message: Buffer.from(unsignedMessage, 'utf8'),
      SigningAlgorithm: SIGNING_ALGORITHM,
    })
  );
  return Buffer.from(result.Signature!).toString('base64url');
}
