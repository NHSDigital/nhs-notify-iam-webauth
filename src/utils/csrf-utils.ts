'use server';

import { jwtDecode } from 'jwt-decode';
import { createHmac, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { getEnvironmentVariable } from './get-environment-variable';
import { getAccessTokenServer } from './amplify-utils';

export const getCsrfFormValue = async () =>
  cookies().get('csrf_token')?.value ?? 'no_token';

export const getSessionId = async () => {
  const accessToken = await getAccessTokenServer();

  if (!accessToken) {
    throw new Error('Could not get access token');
  }

  const jwt = jwtDecode(accessToken);

  const sessionId = jwt.jti;

  if (!sessionId) {
    throw new Error('Could not get session ID');
  }

  return sessionId;
};

export const generateCsrf = async () => {
  const secret = getEnvironmentVariable('CSRF_SECRET');
  const sessionId = await getSessionId();

  const salt = randomBytes(8).toString('hex');

  const hash = createHmac('sha256', secret)
    .update(sessionId)
    .update(salt)
    .digest('hex');

  const csrfToken = `${hash}.${salt}`;

  cookies().set('csrf_token', csrfToken, {
    httpOnly: true,
    secure: true,
  });

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

export const verifyCsrfTokenFull = async (formData: FormData) => {
  const secret = getEnvironmentVariable('CSRF_SECRET');
  const sessionId = await getSessionId();
  const csrfTokenCookie = cookies().get('csrf_token');

  if (!csrfTokenCookie) {
    throw new Error('missing CSRF cookie');
  }

  const csrfTokenCookieValue = csrfTokenCookie.value;

  const csrfTokenFormField = formData.get('csrf_token');

  if (!csrfTokenFormField) {
    throw new Error('missing CSRF form field');
  }

  if (csrfTokenFormField !== csrfTokenCookieValue) {
    throw new Error('CSRF mismatch');
  }

  const formVerification = await verifyCsrfToken(
    csrfTokenFormField,
    secret,
    sessionId
  );

  if (!formVerification) {
    throw new Error('CSRF error');
  }

  return true;
};
