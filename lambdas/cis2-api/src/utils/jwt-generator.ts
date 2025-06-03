import { randomUUID } from 'node:crypto';
import { getPayloadSignature } from '@/src/utils/aws/kms-util';

const SIGNING_ALGORITHM = 'RS512';

export async function generateJwt(keyId: string, clientId: string) {
  const jwtId = randomUUID();
  const nowSeconds = Math.floor(Date.now() / 1000);
  const expirySeconds = nowSeconds + 5 * 60;

  const header = {
    alg: SIGNING_ALGORITHM,
    kid: keyId,
  };

  const body = {
    iss: clientId,
    sub: clientId,
    aud: `${process.env.CIS2_URL}/access_token`,
    jti: jwtId,
    iat: nowSeconds,
    exp: expirySeconds,
  };

  const headerEncoded = Buffer.from(JSON.stringify(header), 'utf8').toString(
    'base64url'
  );
  const bodyEncoded = Buffer.from(JSON.stringify(body), 'utf8').toString(
    'base64url'
  );

  const unsignedMessage = `${headerEncoded}.${bodyEncoded}`;

  const signature = await getPayloadSignature(keyId, unsignedMessage);
  return `${unsignedMessage}.${signature}`;
}
