import { JWK } from 'node-jose';

export async function parseJwksPublicSigningKeys(
  rawJwks: string
): Promise<JWK.Key[]> {
  const jwks = JSON.parse(rawJwks) as { keys: object[] };
  return Promise.all(jwks.keys.map((jwk) => JWK.asKey(jwk)));
}
