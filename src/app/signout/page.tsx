'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { signOut } from '@aws-amplify/auth';
import { Redirect } from '@/src/components/molecules/Redirect/Redirect';

const SignOut = () => {
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    if (!signedOut) {
      signOut().then(() => setSignedOut(true));
    }
  }, [signedOut]);

  return signedOut ? <Redirect /> : <p>Signing out</p>;
};

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SignOut />
    </Suspense>
  );
}
