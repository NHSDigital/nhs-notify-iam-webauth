'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { Redirect } from '@/src/components/molecules/Redirect/Redirect';
import fetchIntercept from 'fetch-intercept';
import { basicCredentialsInterceptor } from '../utils/basic-credentials-interceptor';
import { Button } from 'nhsuk-react-components';
import { useSearchParams } from 'next/navigation';
import { cis2Login, getCis2AmplifyConfiguration } from '../utils/cis2-login';
import { cognitoUserPoolsTokenProvider } from '@aws-amplify/auth/cognito';
import { Amplify } from 'aws-amplify';
import { defaultStorage } from 'aws-amplify/utils';
import { getAuthTokens } from '../utils/cis2-token-retriever';
import { randomUUID } from 'crypto';


fetchIntercept.register(basicCredentialsInterceptor);

const clientId = Amplify.getConfig().Auth?.Cognito.userPoolClientId;
const OAUTH_PKCE_KEY = `CognitoIdentityServiceProvider.${clientId}.oauthPKCE`;

const AuthenticatorWrapper = (props: { redirectPath: string, requestRef: string }) => {
  Amplify.configure(getCis2AmplifyConfiguration(), { ssr: true });
  return withAuthenticator(Redirect, {
    variation: 'default',
    hideSignUp: true,
    components: {
      SignIn: {
        Header: () => (
          <Button onClick={() => cis2Login(props.redirectPath, props.requestRef)}>CIS2</Button>
        ),
      },
    },
  })({});
};

cognitoUserPoolsTokenProvider.authTokenStore.keyValueStorage?.getItem('')

export default function Page() {

  console.log(JSON.stringify(Amplify.getConfig()));
  console.log(Amplify.getConfig());
  // const [requestRef] = useState(randomUUID().toString());
  
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirectPath');
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  

  // useEffect(() => {
  //   if (!code) {
  //     return;
  //   }


  //   defaultStorage.getItem(OAUTH_PKCE_KEY)
  //     .then((codeVerifier) => getAuthTokens(code, codeVerifier || ''))
  //     .then((tokens) => console.log(`Tokens ${JSON.stringify(tokens)}`));
  // }, [code]);

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AuthenticatorWrapper redirectPath={redirectPath || ''} requestRef={''} />
    </Suspense>
  );
}
