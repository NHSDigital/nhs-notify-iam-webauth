/* eslint-disable import-x/prefer-default-export */
'use server';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getSessionId } from '@/utils/amplify-utils';
import { generateSessionCsrfToken } from '@/utils/csrf-utils';
import { getTemplatesUrl } from '@/utils/get-templates-url';

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

    redirectPath = getTemplatesUrl(redirectPath);
  } else {
    cookieStore.delete('csrf_token');

    const authUrl = new URL('/auth', request.url);

    const redirectParam = request.nextUrl.searchParams.get('redirect');

    if (redirectParam) {
      authUrl.searchParams.set('redirect', redirectParam);
    }

    redirectPath = authUrl.toString();
  }

  return NextResponse.redirect(redirectPath, { status: 307 });
};
