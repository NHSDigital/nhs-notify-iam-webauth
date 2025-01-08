'use server';

import crypto from 'crypto';
import { USER_POOL_CLIENT_ID } from '@/src/utils/constants';

const userPoolClientSecret = process.env.USER_POOL_CLIENT_SECRET || '';

export async function generateClientSecretHash(
  username: string
): Promise<string> {
  const hasher = crypto.createHmac('sha256', userPoolClientSecret);
  hasher.update(username);
  hasher.update(USER_POOL_CLIENT_ID);
  return hasher.digest('base64');
}
