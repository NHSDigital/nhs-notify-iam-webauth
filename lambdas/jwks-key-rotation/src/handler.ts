import type { ScheduledHandler } from 'aws-lambda';
import { logger } from './utils/logger';
import {
  getKeyDirectory,
  SigningKeyDirectory,
} from './utils/key-directory-repository';
import { createPublicKey } from 'node:crypto';
import { JWK } from 'node-jose';
import { generateKey, getPublicKey } from './utils/key-util';

const algorithm = 'RS512';

const keyLifetimeDays = Number.parseInt(process.env.KEY_LIFETIME_DAYS ?? '28');
const keyLifetimeMillis = keyLifetimeDays * 24 * 60 * 60 * 1000;

function formattedDate(offsetMillis = 0): string {
  return new Date(Date.now() + offsetMillis).toISOString().split('T')[0];
}

function getKeysToDelete(
  keyDirectory: SigningKeyDirectory
): SigningKeyDirectory {
  if (keyDirectory.length <= 1) {
    return [];
  }
  const cutOffDate = formattedDate(-keyLifetimeMillis);
  return keyDirectory.filter(
    (keyMetadata) => keyMetadata.createdDate <= cutOffDate
  );
}

async function generateJwksFormat(
  keyId: string,
  publicKeyBytes: Uint8Array
): Promise<unknown> {
  const base64EncodedPublicKey = Buffer.from(publicKeyBytes).toString('base64');
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
    use: 'sig',
    alg: algorithm,
    kid: keyId,
  };

  return publicKeyJwks;
}

export const handler: ScheduledHandler = async () => {
  // Get the existing key directory
  const keyDirectory = await getKeyDirectory();
  logger.info(keyDirectory);

  // Dertermine which keys we should remove
  const keysToDelete = getKeysToDelete(keyDirectory);
  const keyIdsToDelete = new Set(
    keysToDelete.map((keyMetadata) => keyMetadata.kid)
  );
  logger.info(keysToDelete);

  // Start creating new directory of remaining keys
  let newKeyDirectory = keyDirectory.filter(
    (keyMetadata) => !keyIdsToDelete.has(keyMetadata.kid)
  );

  // Create the new key
  const keyId = await generateKey();
  newKeyDirectory.push({
    createdDate: formattedDate(),
    kid: keyId,
  });
  logger.info(keyId);
  logger.info(newKeyDirectory);

  // Get the public keys
  const publicKeys = await Promise.all(
    newKeyDirectory.map((keyMetadata) => getPublicKey(keyMetadata.kid))
  );
  logger.info(publicKeys);

  // Make sure that the directory stays in sync with the KMS keys (i.e. remove any that may have been manually removed)
  const validPublicKeyMap = publicKeys
    .filter((publicKeyMetadata) => !!publicKeyMetadata.publicKey)
    .reduce(
      (acc, publicKeyMetadata) => {
        acc[publicKeyMetadata.keyId] = publicKeyMetadata.publicKey!;
        return acc;
      },
      {} as Record<string, Uint8Array>
    );

  newKeyDirectory = newKeyDirectory.filter(
    (keyMetadata) => !!validPublicKeyMap[keyMetadata.kid]
  );

  // Generate new public key file
  const publicKeysArray = await newKeyDirectory.map((keyMetadata) => {
    const publicKeyBytes = validPublicKeyMap[keyMetadata.kid];
    return generateJwksFormat(keyMetadata.kid, publicKeyBytes);
  });

  logger.info('Generated public keys', { publicKeysArray });

  // Write public key file to S3

  // Update Key directory

  // Delete old keys
};
