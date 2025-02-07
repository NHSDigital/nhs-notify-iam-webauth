'use client';

import React, { Suspense, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';

const SignOut = () => {
  const { authStatus, signOut } = useAuthenticator((ctx) => [ctx.authStatus]);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      signOut();
    }
  }, [authStatus, signOut]);

  return <p>Signing out</p>;
};

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SignOut />
    </Suspense>
  );
}
