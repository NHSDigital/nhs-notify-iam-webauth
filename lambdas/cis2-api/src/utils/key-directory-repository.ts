/* eslint-disable unicorn/prefer-at */
import { z } from 'zod';
import { logger } from '@/src/utils/logger';
import { getParameter } from '@/src/utils/aws/ssm-util';

const schemaFor =
  <Output, Input = Output>() =>
    <S extends z.ZodType<Output, z.ZodTypeDef, Input>>(schema: S) =>
      schema;

export type SigningKeyMetaData = {
  kid: string;
  createdDate: string;
};

export type SigningKeyDirectory = SigningKeyMetaData[];

const $SigningKeyMetaData = schemaFor<SigningKeyMetaData>()(
  z.object({
    kid: z.string().nonempty(),
    createdDate: z.string().date(),
  })
);

const $SigningKeyDirectory = schemaFor<SigningKeyDirectory>()(
  z.array($SigningKeyMetaData)
);

// Ignore any very new keys to allow public key caches to expire
const keyCoolingOffPeriodMillis = 24 * 60 * 60 * 1000;

function formattedDate(offsetMillis = 0): string {
  return new Date(Date.now() + offsetMillis).toISOString().split('T')[0];
}

async function getKeyDirectory(): Promise<SigningKeyDirectory> {
  const ssmResult = await getParameter(process.env.SSM_KEY_DIRECTORY_NAME);

  const keyDirectoryText = ssmResult ?? '[]';
  const parseResult = $SigningKeyDirectory.safeParse(
    JSON.parse(keyDirectoryText)
  );
  if (!parseResult.success) {
    logger.error('Failed to parse key directory', {
      content: keyDirectoryText,
      parseError: parseResult.error,
    });
    throw new Error('Failed to parse key directory');
  }
  return parseResult.data;
}

export async function getKmsSigningKeyId(): Promise<string> {
  const keyDirectory = await getKeyDirectory();
  if (keyDirectory.length <= 0) {
    throw new Error('Empty key directory');
  }

  // Pick the only key.
  if (keyDirectory.length === 1) {
    return keyDirectory[0].kid;
  }

  // Pick the latest key that is older than 24 hours.
  const sortedKeyDirectory = keyDirectory.toSorted((a, b) =>
    `${a.createdDate}_${a.kid}`.localeCompare(`${b.createdDate}_${b.kid}`)
  );
  const cutOffDate = formattedDate(-keyCoolingOffPeriodMillis);
  const activeKeys = sortedKeyDirectory.filter(
    (entry) => entry.createdDate.localeCompare(cutOffDate) <= 0
  );
  if (activeKeys.length > 0) {
    return activeKeys[activeKeys.length - 1].kid;
  }

  // There are no keys older than 24 hours so just pick the first.
  return sortedKeyDirectory[0].kid;
}
