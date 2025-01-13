'use server';

import crypto from 'crypto';
import { getConstants } from '@/src/utils/public-constants';

export async function generateClientSecretHash(
  username: string
): Promise<string> {
  const userPoolClientId = getConstants().USER_POOL_CLIENT_ID;
  const userPoolClientSecret = process.env.USER_POOL_CLIENT_SECRET;
  console.log(userPoolClientSecret);

  if (!userPoolClientSecret || !userPoolClientId) {
    throw new Error(
      `Missing client id or secret: ID(${!!userPoolClientSecret}) Secret(${!!userPoolClientId})`
    );
  }
  const hasher = crypto.createHmac('sha256', userPoolClientSecret);
  hasher.update(username);
  hasher.update(userPoolClientId);
  return hasher.digest('base64');
}
