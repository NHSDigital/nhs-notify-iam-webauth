'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { Hub } from '@aws-amplify/core';
import Login from '../components/Login';

export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const [redirect, setRedirect] = useState<string | undefined>();

  useEffect(() => {
    return Hub.listen('auth', ({ payload }) => {
      console.log('payload', payload);
      if (payload.event === 'customOAuthState') {
        try {
          const { redirectPath } = JSON.parse(payload.data);
          setRedirect(redirectPath);
        } catch (error) {
          console.error(error);
          setRedirect('Invalid redirect path');
        }
      } else {
        throw new Error('Unexpected payload event');
      }
    });
  }, []);

  let redirectPath = redirect || [searchParams.redirect].flat().pop() || '/';

  console.log('redirect', redirectPath, redirect, searchParams);

  if (redirectPath === '/auth') redirectPath = '/';

  console.log('hostname', window.location.hostname);

  return (
    <Suspense>
      <Login redirectPath={redirectPath} />
    </Suspense>
  );
}
