'use client';

import React, { Suspense } from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { Redirect } from '@/src/components/molecules/Redirect/Redirect';

const AuthenticatorWrapper = () => {
  return withAuthenticator(Redirect, {
    variation: 'default',
    hideSignUp: true,
  })({});
};

export default function Page() {
  return (
    <Suspense>
      <AuthenticatorWrapper />
    </Suspense>
  );
}
