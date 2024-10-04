'use client';

import { useSearchParams, redirect } from 'next/navigation';

export const Redirect = () => {
  const searchParams = useSearchParams();

  const redirectPath = searchParams.get('redirect') ?? '/';

  redirect(`/redirect${redirectPath}`);
};
