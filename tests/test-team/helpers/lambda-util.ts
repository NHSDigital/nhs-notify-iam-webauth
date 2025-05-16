import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { logger } from './logger';

const lambdaClient = new LambdaClient({
  region: process.env.REGION,
});

export async function invokeLambda(lambdaName: string): Promise<void> {
  logger.info(`Invoking lambda ${lambdaName}`);

  const response = await lambdaClient.send(
    new InvokeCommand({
      FunctionName: lambdaName,
    })
  );

  if (response.StatusCode !== 200) {
    throw new Error(`Unexpected lambda response ${JSON.stringify(response)}`);
  }
}
