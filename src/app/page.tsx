'use client';

import React, { Suspense, useEffect } from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import fetchIntercept from 'fetch-intercept';
import { basicCredentialsInterceptor } from '../utils/basic-credentials-interceptor';
import { Redirect } from '@/src/components/molecules/Redirect/Redirect';
import { Button } from 'nhsuk-react-components';
import { useSearchParams } from 'next/navigation';
import { cis2Login } from '../utils/cis2-login';
import { cognitoUserPoolsTokenProvider } from '@aws-amplify/auth/cognito';
import { Amplify } from 'aws-amplify';
import { defaultStorage } from 'aws-amplify/utils';


fetchIntercept.register(basicCredentialsInterceptor);

const clientId = Amplify.getConfig().Auth?.Cognito.userPoolClientId;
const OAUTH_PKCE_KEY = `CognitoIdentityServiceProvider.${clientId}.oauthPKCE`;

const AuthenticatorWrapper = (props: { redirectPath: string }) => {
  return withAuthenticator(Redirect, {
    variation: 'default',
    hideSignUp: true,
    components: {
      SignIn: {
        Header: () => (
          <Button onClick={() => cis2Login(props.redirectPath)}>CIS2</Button>
        ),
      },
    },
  })({});
};

cognitoUserPoolsTokenProvider.authTokenStore.keyValueStorage?.getItem('')

export default function Page() {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirectPath');
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  useEffect(() => {
    if (!code) {
      return;
    }

    defaultStorage.getItem(OAUTH_PKCE_KEY)
      .then((pixy) => console.log(pixy));
  }, [code]);

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AuthenticatorWrapper redirectPath={redirectPath || ''} />
    </Suspense>
  );
}
