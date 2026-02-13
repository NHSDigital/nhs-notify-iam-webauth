/* eslint-disable import-x/prefer-default-export */
'use server';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getSessionId } from '@/utils/amplify-utils';
import { generateSessionCsrfToken } from '@/utils/csrf-utils';
import { getEnvironmentVariable } from '@/utils/get-environment-variable';

const POOL_CLIENT_ID = getEnvironmentVariable(
  'NEXT_PUBLIC_USER_POOL_CLIENT_ID'
);

const COGNITO_COOKIE_PREFIX = 'CognitoIdentityServiceProvider.';

export const GET = async (request: NextRequest) => {
  const sessionId = await getSessionId({ forceRefresh: true });

  const cookieStore = await cookies();

  for (const cookie of cookieStore.getAll()) {
    if (
      cookie.name.startsWith(COGNITO_COOKIE_PREFIX) &&
      !cookie.name.startsWith(`${COGNITO_COOKIE_PREFIX}${POOL_CLIENT_ID}.`)
    )
      cookieStore.delete(cookie.name);
  }

  let redirectPath =
    `/${request.nextUrl.searchParams.get('redirect') ?? '/templates/message-templates'}`.replace(
      /^\/+/,
      '/'
    );

  if (sessionId) {
    const csrfToken = await generateSessionCsrfToken(sessionId);

    cookieStore.set('csrf_token', csrfToken, {
      sameSite: 'strict',
      secure: true,
    });
  } else {
    cookieStore.delete('csrf_token');
    redirectPath = '/auth';

    const redirectParam = request.nextUrl.searchParams.get('redirect');

    if (redirectParam) {
      redirectPath += `?redirect=${encodeURIComponent(redirectParam)}`;
    }
  }

  return NextResponse.json(null, {
    status: 307,
    headers: {
      Location: redirectPath,
    },
  });
};
