/* eslint-disable import-x/prefer-default-export */
'use server';

import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getSessionId } from '@/utils/amplify-utils';
import { generateSessionCsrfToken } from '@/utils/csrf-utils';
import { getEnvironmentVariable } from '@/utils/get-environment-variable';

function isCurrentCognitoUserPoolCookie(cookie: RequestCookie) {
  const poolIdPattern = /^CognitoIdentityServiceProvider\.([^.]+)\./;

  const poolIdMatch = poolIdPattern.exec(cookie.name);
  const poolId = poolIdMatch?.[1];

  return poolId === getEnvironmentVariable('NEXT_PUBLIC_USER_POOL_CLIENT_ID');
}

/**
 * Deletes all Cognito cookies that are not linked to the current user pool
 */
function tidyCognitoCookies(cookieStore: ReadonlyRequestCookies) {
  for (const cookie of cookieStore.getAll()) {
    if (
      cookie.name.startsWith('CognitoIdentityServiceProvider.') &&
      !isCurrentCognitoUserPoolCookie(cookie)
    ) {
      console.log(cookie.name);
      cookieStore.delete(cookie.name);
    }
  }
}

export const GET = async (request: NextRequest) => {
  const sessionId = await getSessionId();
  const cookieStore = await cookies();

  tidyCognitoCookies(cookieStore);

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
