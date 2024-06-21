'use client';

import { Header } from 'nhsuk-react-components';
import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';

export default function LoginStatus() {
  const { authStatus } = useAuthenticator();
  switch (authStatus) {
    case 'authenticated':
      return <Header.NavItem href="/auth/signout">
        Sign out
      </Header.NavItem>;
    case 'unauthenticated':
      return <Header.NavItem href={`/auth/?redirect=${location.pathname}`}>
        Sign in
      </Header.NavItem>;
    default:
      return null;
  }
}
