'use client';

import React, { useEffect, useState } from 'react';
import { signOut } from '@aws-amplify/auth';
import { Redirect } from './Redirect';

export default function Page() {
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    if (!signedOut) {
      signOut()
        .then(() => setSignedOut(true))
        .catch((error) => console.error(error));
    }
  });

  if (signedOut) {
    <Redirect />;
  } else {
    <p>Signing out</p>;
  }
}
