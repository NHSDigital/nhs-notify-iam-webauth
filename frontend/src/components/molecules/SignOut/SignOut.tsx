'use client';

import { useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { signOut } from '@aws-amplify/auth';
import JsCookie from 'js-cookie';
import { authenticatorSelector } from '@/src/utils/authenticator-selector';

export const SignOut = ({ children }: { children?: React.ReactNode }) => {
  const { authStatus } = useAuthenticator(authenticatorSelector);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      signOut({ global: true });
      JsCookie.remove('csrf_token');
    }
  }, [authStatus]);

  return authStatus === 'authenticated' ? <p>Signing out</p> : children;
};
