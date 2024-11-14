'use client';

import { useSearchParams, redirect, RedirectType } from 'next/navigation';

export const Redirect = () => {
  const searchParams = useSearchParams();

  const redirectPath = searchParams.get('redirect');

  if (!redirectPath) {
    // Note: /home get's redirected to / This is to bypass NextJs' base path which is /auth.
    return redirect('/home', RedirectType.push);
  }

  return redirect(`/redirect/${redirectPath}`, RedirectType.push);
};
