import { getPayloadSignature } from './aws/kms-util';

const SIGNING_ALGORITHM = 'RS512';

export async function generateJwt(keyId: string, clientId: string) {
  const jwtId = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 5 * 60;

  const header = {
    alg: SIGNING_ALGORITHM,
    kid: keyId,
  };

  const body = {
    iss: clientId,
    sub: clientId,
    aud: `${process.env.CIS2_URL}/access_token`,
    jti: jwtId,
    iat: now,
    exp: expiry,
  };

  const headerEncoded = Buffer.from(JSON.stringify(header), 'utf-8').toString(
    'base64url'
  );
  const bodyEncoded = Buffer.from(JSON.stringify(body), 'utf-8').toString(
    'base64url'
  );

  const unsignedMessage = `${headerEncoded}.${bodyEncoded}`;

  const signature = await getPayloadSignature(keyId, unsignedMessage);
  const jwt = `${unsignedMessage}.${signature}`;

  console.log(jwt);
  return jwt;
}
