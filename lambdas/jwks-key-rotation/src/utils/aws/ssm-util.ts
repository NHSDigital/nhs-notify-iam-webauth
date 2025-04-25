import {
  GetParameterCommand,
  GetParameterCommandOutput,
  PutParameterCommand,
  PutParameterCommandOutput,
  SSMClient,
} from '@aws-sdk/client-ssm';
import { logger } from '@/src/utils/logger';

const ssmClient = new SSMClient({
  region: process.env.REGION,
  retryMode: 'standard',
  maxAttempts: 10,
});

export async function getParameter(
  name = ''
): Promise<GetParameterCommandOutput> {
  if (!name) {
    throw new Error('Missing parameter name');
  }

  return ssmClient.send(
    new GetParameterCommand({
      Name: name,
    })
  );
}

export async function putParameter(value: string, name = ''): Promise<void> {
  if (!name) {
    throw new Error('Missing parameter name');
  }

  logger.info(`Updating parameter ${name}`);

  ssmClient.send(
    new PutParameterCommand({
      Name: name,
      Value: value,
      Overwrite: true,
    })
  );
}
