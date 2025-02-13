'use server';

import { cookies } from 'next/headers';
import { generateCsrf } from '../../utils/csrf-utils';

export const GET = async (request: Request) => {
  console.log('DEBUG');
  console.log(request.url);
  console.log(new URL(request.url));
  console.log(new URL(request.url).searchParams);
  console.log(new URL(request.url).searchParams.entries().toArray());
  const redirectPath = new URL(request.url).searchParams.get('redirect') ?? '/';

  const csrfToken = await generateCsrf();

  const resJson = { csrfToken };

  cookies().set('csrf_token', csrfToken);

  return Response.json(resJson, {
    status: 302,
    headers: {
      Location: redirectPath,
    },
  });
};
