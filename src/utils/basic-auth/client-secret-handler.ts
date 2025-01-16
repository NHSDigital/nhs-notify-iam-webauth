'use server';

import crypto from 'crypto';
import { Amplify } from 'aws-amplify';

// eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module, import/no-unresolved
Amplify.configure(require('@/amplify_outputs.json'), { ssr: true });

export async function generateClientSecretHash(
  username: string
): Promise<string> {
  const userPoolClientId = Amplify.getConfig().Auth?.Cognito.userPoolClientId;
  const userPoolClientSecret = process.env.USER_POOL_CLIENT_SECRET;

  if (!userPoolClientSecret || !userPoolClientId) {
    throw new Error(
      `Missing client id or secret: ID(${!!userPoolClientSecret}) Secret(${!!userPoolClientId})`
    );
  }

  if (!username) {
    throw new Error('Missing username');
  }
  const hasher = crypto.createHmac('sha256', userPoolClientSecret);
  hasher.update(username);
  hasher.update(userPoolClientId);
  return hasher.digest('base64');
}
