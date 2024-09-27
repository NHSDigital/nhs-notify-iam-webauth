'use client';

import React, { useEffect, useState } from 'react';
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
  
  if (redirectPath === '/auth') redirectPath = '/';

  return <Login redirectPath={redirectPath} />;
}
