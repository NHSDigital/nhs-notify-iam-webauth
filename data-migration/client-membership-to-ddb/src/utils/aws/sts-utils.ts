import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts';

const stsClient = new STSClient({ region: process.env.REGION });

export async function getAccountId(): Promise<string> {
  const callerIdentity = await stsClient.send(new GetCallerIdentityCommand());
  const accountId = callerIdentity.Account;

  if (!accountId) {
    throw new Error('Unable to get account ID from caller');
  }
  return accountId;
}
