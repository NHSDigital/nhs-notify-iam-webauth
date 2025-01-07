'use client';

import React, { Suspense } from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import fetchIntercept from 'fetch-intercept';
import { basicCredentialsInterceptor } from '../utils/basic-credentials-interceptor';
import { postLoginRedirect } from '@/src/components/molecules/Redirect/Redirect';

const AuthenticatorWrapper = () => {
  return withAuthenticator(postLoginRedirect, {
    variation: 'default',
    hideSignUp: true,
    components: {
      SignIn: {
        Header: () => <></>,
      },
    },
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
