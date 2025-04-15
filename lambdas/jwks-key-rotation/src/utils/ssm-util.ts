import {
  GetParameterCommand,
  GetParameterCommandOutput,
  SSMClient,
} from '@aws-sdk/client-ssm';

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
