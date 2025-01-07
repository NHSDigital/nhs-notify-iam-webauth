'use client';

import { useSearchParams, redirect, RedirectType } from 'next/navigation';
import path from 'path';

export function getRedirectPath(): string {
  const searchParams = useSearchParams();

  const requestDirectPath = searchParams.get('redirect');

  if (!requestDirectPath) {
    // Note: /home get's redirected to / This is to bypass NextJs' base path which is /auth.
    return '/home';
  }

  const redirectPath = path.normalize(`/redirect/${requestDirectPath}`);

  return redirectPath;
} 

export function postLoginRedirect(): never {
  return redirect(getRedirectPath(), RedirectType.push);
};
