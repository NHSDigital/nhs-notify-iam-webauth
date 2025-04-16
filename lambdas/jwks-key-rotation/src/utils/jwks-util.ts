import { createPublicKey } from 'node:crypto';
import { JWK } from 'node-jose';
import { writeJsonToFile } from './aws/s3-util';
import { logger } from './logger';

const ALGORITHM_RSA_512 = 'RS512';
const KEY_USE_SIGNING = 'sig';

export async function generateJwksFormat(
  keyId: string,
  publicKey: Uint8Array
): Promise<unknown> {
  const base64EncodedPublicKey = Buffer.from(publicKey).toString('base64');
  const pemFormat = `-----BEGIN PUBLIC KEY-----\n${base64EncodedPublicKey
    .match(/(.{1,64})/g)!!
    .join('\n')}\n-----END PUBLIC KEY-----`;

  const key = createPublicKey(pemFormat);

  const joseKey = await JWK.asKey(
    key.export({
      type: 'spki',
      format: 'pem',
    }),
    'pem'
  );

  const publicKeyJwks = {
    ...joseKey.toJSON(),
    use: KEY_USE_SIGNING,
    alg: ALGORITHM_RSA_512,
    kid: keyId,
  };

  return publicKeyJwks;
}

export async function updateJwksFile(
  publicKeys: Array<{ keyId: string; publicKey: Uint8Array }>
): Promise<void> {
  const publicKeysArray = await Promise.all(
    publicKeys.map((keyMetadata) =>
      generateJwksFormat(keyMetadata.keyId, keyMetadata.publicKey)
    )
  );

  const jwksFileContents = JSON.stringify(publicKeysArray);
  logger.info(`Generated JWKS file content with ${publicKeysArray.length} public keys`);
  await writeJsonToFile('jwks', jwksFileContents, process.env.S3_PUBLIC_KEYS_BUCKET_NAME);
}
