'use client';

import { useSearchParams, redirect, RedirectType } from 'next/navigation';
import path from 'path';

export const Redirect = () => {
  const searchParams = useSearchParams();

  const requestDirectPath = searchParams.get('redirect');

  if (!requestDirectPath) {
    // Note: /home get's redirected to / This is to bypass NextJs' base path which is /auth.
    return redirect('/home', RedirectType.push);
  }

  const redirectPath = path.normalize(`/redirect/${requestDirectPath}`);

  return redirect(redirectPath, RedirectType.push);
};
