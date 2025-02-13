'use client';

import { Suspense, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { authenticatorSelector } from '@/src/utils/authenticator-selector';

export const SignOut = ({ children }: { children?: React.ReactNode }) => {
  const { signOut, authStatus } = useAuthenticator(authenticatorSelector);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      signOut();
    }
  }, [authStatus, signOut]);

  const SigningOut = <p>Signing out</p>;

  return (
    <Suspense fallback={SigningOut}>
      {authStatus === 'authenticated' ? SigningOut : children}
    </Suspense>
  );
};
