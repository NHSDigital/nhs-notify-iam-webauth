'use server';

import { createHmac, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { logger } from '@nhs-notify-iam-webauth/utils-logger';
import { getEnvironmentVariable } from './get-environment-variable';
import { getSessionId } from './amplify-utils';

export const generateSessionCsrfToken = async (sessionId: string) => {
  const secret = getEnvironmentVariable('CSRF_SECRET');

  const salt = randomBytes(8).toString('hex');

  const hash = createHmac('sha256', secret)
    .update(sessionId)
    .update(salt)
    .digest('hex');

  const csrfToken = `${hash}.${salt}`;

  return csrfToken;
};

export const verifyCsrfToken = async (
  csrfToken: string,
  secret: string,
  sessionId: string
) => {
  const [hmac, salt] = csrfToken.split('.');

  const expectedHmac = createHmac('sha256', secret)
    .update(sessionId)
    .update(salt)
    .digest('hex');

  return expectedHmac === hmac;
};

export const verifyFormCsrfToken = async (formData: FormData) => {
  const secret = getEnvironmentVariable('CSRF_SECRET');
  const sessionId = await getSessionId();

  if (!sessionId) {
    logger.error('Unauthenticated');
    return false;
  }

  const cookieStore = await cookies();
  const csrfTokenCookie = cookieStore.get('csrf_token');

  if (!csrfTokenCookie) {
    logger.error('missing CSRF cookie');
    return false;
  }

  const csrfTokenCookieValue = csrfTokenCookie.value;

  const csrfTokenFormField = formData.get('csrf_token');

  if (!csrfTokenFormField) {
    logger.error('missing CSRF form field');
    return false;
  }

  if (csrfTokenFormField !== csrfTokenCookieValue) {
    logger.error('CSRF mismatch');
    return false;
  }

  const formVerification = await verifyCsrfToken(
    csrfTokenFormField,
    secret,
    sessionId
  );

  if (!formVerification) {
    logger.error('CSRF error');
    return false;
  }

  return true;
};
