/* eslint-disable import-x/prefer-default-export */
'use server';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getSessionId } from '@/utils/amplify-utils';
import { generateSessionCsrfToken } from '@/utils/csrf-utils';

export const GET = async (request: NextRequest) => {
  const sessionId = await getSessionId();
  const cookieStore = await cookies();

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
