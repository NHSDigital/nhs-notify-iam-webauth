'use client';

import React, { useEffect, useState } from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { Redirect } from '@/src/components/molecules/Redirect/Redirect';
import fetchIntercept from 'fetch-intercept';
import { basicCredentialsInterceptor } from '@/src/utils/basic-auth/basic-credentials-interceptor';
import { Button } from 'nhsuk-react-components';
import { redirect, RedirectType, useSearchParams } from 'next/navigation';
import { cis2Login, stateParser, storeTokens } from '@/src/utils/cis2/cis2-login';
import {
  getCurrentUser,
  GetCurrentUserOutput,
} from '@aws-amplify/auth/cognito';
import { Amplify } from 'aws-amplify';
import { defaultStorage } from 'aws-amplify/utils';
import { getAuthTokens } from '@/src/utils/cis2/cis2-token-retriever';

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

export default function Page() {
  const [postLoginState, setPostLoginState] = useState('');
  const [user, setUser] = useState<GetCurrentUserOutput | undefined>();

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => {});
  }, [user]);

  const searchParams = useSearchParams();
  let redirectPath = searchParams.get('redirect');
  let code = searchParams.get('code');
  const stateQueryParameter = searchParams.get('state');

  if (!redirectPath && postLoginState) {
    const parsedState = stateParser(postLoginState);
    if (parsedState) {
      parsedState.redirectPath;
      redirect(
        `?redirect=${encodeURIComponent(parsedState.redirectPath)}`,
        RedirectType.replace
      );
    }
  }

  useEffect(() => {
    if (!code || postLoginState) {
      return;
    }

    defaultStorage
      .getItem(OAUTH_PKCE_KEY)
      .then((codeVerifier) => getAuthTokens(code, codeVerifier || ''))
      .then((authTokens) => storeTokens(authTokens))
      .then((stored) => {
        if (stored) {
          return defaultStorage
            .removeItem(OAUTH_PKCE_KEY)
            .then(() => setPostLoginState(stateQueryParameter || ''));
        }
      });
  }, [code]);

  return (
    <>
      {user && redirectPath ? (
        <Redirect />
      ) : (
        <AuthenticatorWrapper redirectPath={redirectPath || ''} />
      )}
    </>
  );
}
