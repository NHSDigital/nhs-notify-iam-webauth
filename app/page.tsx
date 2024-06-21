'use client';

import React, { useEffect, useState } from 'react';
import { Hub } from '@aws-amplify/core';
import Login from '../components/Login';

export default function Page({ searchParams }: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {

  const [redirect, setRedirect] = useState<string | undefined>();

  useEffect(() => {
    return Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'customOAuthState':
          try {
            const { redirectPath } = JSON.parse(payload.data);
            setRedirect(redirectPath);
          } catch (err) {
            console.error(err);
            setRedirect('Invalid redirect path');
          }
          break;
      }
    });
  }, []);

  let redirectPath = redirect || [searchParams.redirect].flat().pop() || '/';
  if (redirectPath === '/auth') redirectPath = '/';
  if (redirectPath && !redirectPath.match(/^\/[a-z/]*$/)) {
    return <h2>Invalid redirect path</h2>;
  }

  return <Login redirectPath={redirectPath} />
}
