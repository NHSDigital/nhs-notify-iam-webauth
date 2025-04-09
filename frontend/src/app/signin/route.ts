'use server';

import { cookies } from 'next/headers';
import { getSessionId } from '@/src/utils/amplify-utils';
import { generateSessionCsrfToken } from '@/src/utils/csrf-utils';
import { NextRequest, NextResponse } from 'next/server';

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
