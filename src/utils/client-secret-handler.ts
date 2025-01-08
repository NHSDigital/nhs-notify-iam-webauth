'use server';

import crypto from 'crypto';
import { USER_POOL_CLIENT_ID } from '@/src/utils/constants';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const { AMPLIFY_APP_ID } = process.env;
const ssmClient = new SSMClient({ region: 'eu-west-2' });

// env var for convenient local testing, deployed apps should use SSM
let userPoolClientSecret = process.env.USER_POOL_CLIENT_SECRET || '';

async function getUserPoolClientSecret(): Promise<string> {
  if (userPoolClientSecret) {
    return userPoolClientSecret;
  }
  const result = await ssmClient.send(
    new GetParameterCommand({
      Name: `/amplify/shared/${AMPLIFY_APP_ID}/USER_POOL_CLIENT_SECRET`,
      WithDecryption: true,
    })
  );
  const value = result.Parameter?.Value || '';
  userPoolClientSecret = value;
  return value;
}

export async function generateClientSecretHash(
  username: string
): Promise<string> {
  const clientSecret = await getUserPoolClientSecret();
  const hasher = crypto.createHmac('sha256', clientSecret);
  hasher.update(username);
  hasher.update(USER_POOL_CLIENT_ID);
  return hasher.digest('base64');
}
