'use client';

import { Suspense, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';

export const SignOut = ({ children }: { children?: React.ReactNode }) => {
  const { signOut, authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

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
