import type { ScheduledHandler } from 'aws-lambda';
import {
  SigningKeyDirectory,
  filterKeyDirectoryToActiveKeys,
  getKeyDirectory,
  writeKeyDirectory,
} from '@/src/utils/key-directory-repository';
import { generateKey, getPublicKey } from '@/src/utils/key-util';
import { updateJwksFile } from '@/src/utils/jwks-util';
import { deleteKey } from '@/src/utils/aws/kms-util';

const keyLifetimeDays = Number.parseInt(
  process.env.KEY_LIFETIME_DAYS ?? '28',
  10
);
const keyLifetimeMillis = keyLifetimeDays * 24 * 60 * 60 * 1000;

function formattedDate(offsetMillis = 0): string {
  return new Date(Date.now() + offsetMillis).toISOString().split('T')[0];
}

function getKeysToDelete(
  keyDirectory: SigningKeyDirectory
): SigningKeyDirectory {
  if (keyDirectory.length <= 0) {
    return [];
  }

  keyDirectory.sort((a, b) => a.createdDate.localeCompare(b.createdDate));
  // eslint-disable-next-line unicorn/prefer-at
  const latestKey = keyDirectory[keyDirectory.length - 1];
  const cutOffDate = formattedDate(-keyLifetimeMillis);
  // Delete any keys that are suffiently old whilst ensuring that we retain the latest key.
  // This is intended to ensure a continued service where public keys may be cached or
  // logins may be in progress whist the key rotation occurs.
  return keyDirectory.filter(
    (keyMetadata) =>
      keyMetadata.kid !== latestKey.kid &&
      keyMetadata.createdDate.localeCompare(cutOffDate) < 0
  );
}

/* eslint-disable unicorn/no-array-reduce */
function buildPublicKeyMap(
  publicKeys: { keyId: string; publicKey?: Uint8Array }[]
) {
  return publicKeys
    .filter((publicKeyMetadata) => !!publicKeyMetadata.publicKey)
    .reduce(
      (acc, publicKeyMetadata) => {
        acc[publicKeyMetadata.keyId] = publicKeyMetadata.publicKey!;
        return acc;
      },
      {} as Record<string, Uint8Array>
    );
}
/* eslint-enable unicorn/no-array-reduce */

export const handler: ScheduledHandler = async () => {
  // Get the existing key directory
  const unfilteredKeyDirectory = await getKeyDirectory();

  // Filter any keys that are pending deletion
  const keyDirectory = await filterKeyDirectoryToActiveKeys(
    unfilteredKeyDirectory
  );

  // Dertermine which keys we should remove
  const keysToDelete = getKeysToDelete(keyDirectory);
  const keyIdsToDelete = new Set(
    keysToDelete.map((keyMetadata) => keyMetadata.kid)
  );

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

  // Get the public keys
  const publicKeys = await Promise.all(
    newKeyDirectory.map((keyMetadata) => getPublicKey(keyMetadata.kid))
  );

  // Make sure that the directory stays in sync with the KMS keys (i.e. remove any that may have been manually removed)
  const validPublicKeyMap = buildPublicKeyMap(publicKeys);
  newKeyDirectory = newKeyDirectory.filter(
    (keyMetadata) => !!validPublicKeyMap[keyMetadata.kid]
  );

  // Generate new public key file
  const publicKeysArray: { keyId: string; publicKey: Uint8Array }[] =
    newKeyDirectory.map((keyMetadata) => ({
      keyId: keyMetadata.kid,
      publicKey: validPublicKeyMap[keyMetadata.kid],
    }));

  // Write public key file to S3
  await updateJwksFile(publicKeysArray);

  // Update Key directory
  await writeKeyDirectory(newKeyDirectory);

  // Delete old keys
  await Promise.all(
    keysToDelete.map((keyMetaData) => deleteKey(keyMetaData.kid))
  );
};
