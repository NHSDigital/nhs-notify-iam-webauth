/* eslint-disable import-x/prefer-default-export */
'use server';

import { AuthSession } from '@aws-amplify/auth';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getSession, getSessionId } from '@/utils/amplify-utils';
import { generateSessionCsrfToken } from '@/utils/csrf-utils';
import { getEnvironmentVariable } from '@/utils/get-environment-variable';

const POOL_CLIENT_ID = getEnvironmentVariable(
  'NEXT_PUBLIC_USER_POOL_CLIENT_ID'
);

const COGNITO_COOKIE_PREFIX = 'CognitoIdentityServiceProvider.';

function isIrrelevantCognitoCookie(
  cookie: RequestCookie,
  session?: AuthSession
) {
  if (!cookie.name.startsWith(COGNITO_COOKIE_PREFIX)) {
    return false;
  }

  if (!session) {
    return true;
  }

  let expectedPrefix = `${COGNITO_COOKIE_PREFIX}${POOL_CLIENT_ID}.`;

  const lastAuthUserCookieName = `${expectedPrefix}LastAuthUser`;

  if (session.userSub) {
    expectedPrefix += `${session.userSub}.`;
  }

  return !(
    cookie.name === lastAuthUserCookieName ||
    cookie.name.startsWith(expectedPrefix)
  );
}

export const GET = async (request: NextRequest) => {
  const session = await getSession({ forceRefresh: true });

  const cookieStore = await cookies();

  for (const cookie of cookieStore.getAll()) {
    // Delete all Cognito cookies relating to other user pools / users
    if (isIrrelevantCognitoCookie(cookie, session)) {
      cookieStore.delete(cookie.name);
    }
  }

  let redirectPath =
    `/${request.nextUrl.searchParams.get('redirect') ?? '/templates/message-templates'}`.replace(
      /^\/+/,
      '/'
    );

  const sessionId = await getSessionId();

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
