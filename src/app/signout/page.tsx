'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { signOut } from '@aws-amplify/auth';
import { postLoginRedirect } from '@/src/components/molecules/Redirect/Redirect';

const SignOut = () => {
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    if (!signedOut) {
      signOut().then(() => setSignedOut(true));
    }
  }, [signedOut]);

  if (signedOut) {
    postLoginRedirect();
  }

  return <p>Signing out</p>;
};

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SignOut />
    </Suspense>
  );
}
