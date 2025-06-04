import { JWK } from 'node-jose';

export async function parseJwksPublicSigningKeys(
  rawJwks: string
): Promise<JWK.Key[]> {
  const jwks = JSON.parse(rawJwks) as object[];
  return Promise.all(jwks.map((jwk) => JWK.asKey(jwk)));
}
