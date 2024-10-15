'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { signOut } from '@aws-amplify/auth';
import { Redirect } from '../../components/molecules/Redirect/Redirect';

export default function Page() {
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    if (!signedOut) {
      signOut().then(() => setSignedOut(true));
    }
  });

  return signedOut ? (
    <Suspense>
      <Redirect />
    </Suspense>
  ) : (
    <p>Signing out</p>
  );
}
