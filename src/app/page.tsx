'use client';

import React, { Suspense } from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import fetchIntercept from 'fetch-intercept';
import { basicCredentialsInterceptor } from '../utils/basic-credentials-interceptor';
import { Redirect } from '@/src/components/molecules/Redirect/Redirect';

const AuthenticatorWrapper = () => {
  return withAuthenticator(Redirect, {
    variation: 'default',
    hideSignUp: true,
  })({});
};

fetchIntercept.register(basicCredentialsInterceptor);

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AuthenticatorWrapper />
    </Suspense>
  );
}
