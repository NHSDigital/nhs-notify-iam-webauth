import { JWK } from 'node-jose';

export async function parseJwksPublicSigningKeys(
  rawJwks: string
): Promise<Array<JWK.Key>> {
  const jwks = JSON.parse(rawJwks) as Array<object>;
  return Promise.all(jwks.map((jwk) => JWK.asKey(jwk)));
}
