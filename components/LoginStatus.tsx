'use client';

import { Header } from 'nhsuk-react-components';
import React, { useEffect, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { JwtPayload } from 'aws-jwt-verify/jwt-model';
import { getBasePath } from '@/utils/get-base-path';

export default function LoginStatus() {
  const { authStatus } = useAuthenticator();
  const [idToken, setIdToken] = useState<JwtPayload | undefined>();
  useEffect(() => {
    (async () => {
      const session = await fetchAuthSession();
      setIdToken(session.tokens?.idToken?.payload);
    })().catch(console.error);
  }, [authStatus]);

  switch (authStatus) {
    case 'authenticated': {
      return [
        <Header.ServiceName key='serviceName'>
          {idToken?.email?.toString() || ''}
        </Header.ServiceName>,
        <Header.NavItem key='navItem' href={`/${getBasePath()}/signout`}>
          Sign out
        </Header.NavItem>,
      ];
    }
    case 'unauthenticated': {
      return (
        <Header.NavItem
          href={`/${getBasePath()}/?redirect=${location.pathname}`}
        >
          Sign in
        </Header.NavItem>
      );
    }
    default: {
      return null;
    }
  }
}
