import {
  GetParameterCommand,
  PutParameterCommand,
  SSMClient,
} from '@aws-sdk/client-ssm';
import { logger } from 'helpers/logger';

const ssmClient = new SSMClient({
  region: process.env.REGION,
  retryMode: 'standard',
  maxAttempts: 10,
});

export async function putParameter(value: string, name: string): Promise<void> {
  logger.info(`Updating parameter ${name}`);

  ssmClient.send(
    new PutParameterCommand({
      Name: name,
      Value: value,
      Overwrite: true,
    })
  );
}

export async function getParameter(name: string): Promise<string> {
  const result = await ssmClient.send(
    new GetParameterCommand({
      Name: name,
    })
  );
  return result.Parameter?.Value || '';
}
