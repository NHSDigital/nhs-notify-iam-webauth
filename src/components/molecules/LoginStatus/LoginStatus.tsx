'use client';

import { Header } from 'nhsuk-react-components';
import React, { useEffect, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession, JWT } from 'aws-amplify/auth';
import { getBasePath } from '@/utils/get-base-path';
import { usePathname } from 'next/navigation';

export const LoginStatus = () => {
  const { authStatus } = useAuthenticator();
  const pathname = usePathname();
  const [idToken, setIdToken] = useState<JWT['payload'] | undefined>();

  useEffect(() => {
    fetchAuthSession().then((session) =>
      setIdToken(session.tokens?.idToken?.payload)
    );
  }, [authStatus]);

  switch (authStatus) {
    case 'authenticated': {
      return [
        <Header.ServiceName key='serviceName'>
          {idToken?.email?.toString() || ''}
        </Header.ServiceName>,
        <Header.NavItem
          key='navItem'
          href={`/${getBasePath()}/signout?redirect=${encodeURIComponent(getBasePath())}${encodeURIComponent(pathname)}`}
        >
          Sign out
        </Header.NavItem>,
      ];
    }
    case 'unauthenticated': {
      return (
        <Header.NavItem
          href={`/${getBasePath()}?redirect=${encodeURIComponent(getBasePath())}${encodeURIComponent(pathname)}`}
        >
          Sign in
        </Header.NavItem>
      );
    }
    default:
  }
};
