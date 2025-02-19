'use client';

import { useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { authenticatorSelector } from '@/src/utils/authenticator-selector';

export const SignOut = ({ children }: { children?: React.ReactNode }) => {
  const { signOut, authStatus } = useAuthenticator(authenticatorSelector);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      signOut();
    }
  }, [authStatus, signOut]);

  return authStatus === 'authenticated' ? <p>Signing out</p> : children;
};
