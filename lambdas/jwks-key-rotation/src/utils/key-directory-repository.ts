import { z } from 'zod';
import { logger } from '@/utils/logger';
import { getParameter, putParameter } from '@/utils/aws/ssm-util';

const schemaFor =
  <Output, Input = Output>() =>
    <S extends z.ZodType<Output, z.ZodTypeDef, Input>>(schema: S) =>
      schema;

export type SigningKeyMetaData = {
  kid: string;
  createdDate: string;
};

export type SigningKeyDirectory = Array<SigningKeyMetaData>;

const $SigningKeyMetaData = schemaFor<SigningKeyMetaData>()(
  z.object({
    kid: z.string().nonempty(),
    createdDate: z.string().date(),
  })
);

const $SigningKeyDirectory = schemaFor<SigningKeyDirectory>()(
  z.array($SigningKeyMetaData)
);

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
