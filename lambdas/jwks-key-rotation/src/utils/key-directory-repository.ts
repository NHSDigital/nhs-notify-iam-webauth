import { z } from 'zod';
import { logger } from '@/src/utils/logger';
import { getParameter, putParameter } from '@/src/utils/aws/ssm-util';
import { getKeyState } from '@/src/utils/aws/kms-util';
import { KeyState } from '@aws-sdk/client-kms';

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

const activeKeyStates: Set<KeyState> = new Set([
  KeyState.Enabled,
  KeyState.Creating,
  KeyState.Updating,
]);

export async function getKeyDirectory(): Promise<SigningKeyDirectory> {
  const ssmResult = await getParameter(process.env.SSM_KEY_DIRECTORY_NAME);

  const keyDirectoryText = ssmResult.Parameter?.Value ?? '[]';
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

export async function writeKeyDirectory(
  keyDirectory: SigningKeyDirectory
): Promise<void> {
  logger.info(`Storing key directory with ${keyDirectory.length} keys`);
  await putParameter(
    JSON.stringify(keyDirectory),
    process.env.SSM_KEY_DIRECTORY_NAME
  );
}

export async function filterKeyDirectoryToActiveKeys(
  keyDirectory: SigningKeyDirectory
): Promise<SigningKeyDirectory> {
  const results = await Promise.all(
    keyDirectory.map((keyMetadata) =>
      getKeyState(keyMetadata.kid).then((result) => ({
        ...keyMetadata,
        keyState: result.keyState,
      }))
    )
  );
  return results
    .filter((entry) => activeKeyStates.has(entry.keyState))
    .map((result) => ({ kid: result.kid, createdDate: result.createdDate }));
}
