'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { signOut } from '@aws-amplify/auth';
import { Redirect } from './Redirect';

export default function Page() {
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    console.log('sign out use effect');
    if (!signedOut) {
      signOut()
        .then(() => setSignedOut(true))
        .then(() => console.log('sign out complete'))
        .catch((error) => console.error(error));
    }
  });

  if (signedOut) {
    <Suspense>
      <Redirect />
    </Suspense>;
  } else {
    <p>Signing out</p>;
  }
}
