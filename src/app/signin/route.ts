'use server';

import { cookies } from 'next/headers';
import { generateCsrf } from '../../utils/csrf-utils';

export const GET = async (request: Request) => {
  const redirectPath = new URL(request.url).searchParams.get('redirect') ?? '/';

  const csrfToken = await generateCsrf();

  const resJson = { csrfToken };

  const cookieStore = await cookies();
  cookieStore.set('csrf_token', csrfToken, {
    sameSite: 'strict',
    secure: true,
  });

  return Response.json(resJson, {
    status: 302,
    headers: {
      Location: redirectPath,
    },
  });
};
