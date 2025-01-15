'use client';

import React, { useEffect, useState } from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import fetchIntercept from 'fetch-intercept';
import { basicCredentialsInterceptor } from '../utils/basic-credentials-interceptor';
import { Redirect } from '@/src/components/molecules/Redirect/Redirect';
import { Button } from 'nhsuk-react-components';
import { redirect, RedirectType, useSearchParams } from 'next/navigation';
import { cis2Login } from '@/src/utils/cis2-login';
import { cognitoUserPoolsTokenProvider, getCurrentUser, GetCurrentUserOutput, signIn } from '@aws-amplify/auth/cognito';
import { Amplify } from 'aws-amplify';
import { defaultStorage } from 'aws-amplify/utils';
import { getAuthTokens, TokenResponse } from '@/src/utils/cis2-token-retriever';
import { decodeJWT, fetchAuthSession } from '@aws-amplify/auth';

fetchIntercept.register(basicCredentialsInterceptor);

const clientId = Amplify.getConfig().Auth?.Cognito.userPoolClientId;
const OAUTH_PKCE_KEY = `CognitoIdentityServiceProvider.${clientId}.oauthPKCE`;

const AuthenticatorWrapper = (props: {
  redirectPath: string;
}) => {
  return withAuthenticator(Redirect, {
    variation: 'default',
    hideSignUp: true,
    components: {
      SignIn: {
        Header: () => (
          <Button
            onClick={() => cis2Login(props.redirectPath)}
          >
            CIS2
          </Button>
        ),
      },
    },
  })({});
};

async function storeTokens(authTokens?: TokenResponse): Promise<boolean> {
  if (!authTokens) {
    return false;
  }

  const accessToken = decodeJWT(authTokens.access_token);
  const idToken = decodeJWT(authTokens.id_token);
  const refreshToken = authTokens.refresh_token;
  const issuedAt = accessToken.payload.iat;
  const clockDrift = issuedAt ? issuedAt * 1000 - new Date().getTime() : 0;
  const username = accessToken.payload.sub || '';

  const cognitoAuthTokens = {
    accessToken: accessToken,
    clockDrift: clockDrift,
    username: username,
    refreshToken: refreshToken,
    idToken: idToken,
    signInDetails: {
      loginId: username,
    },
  };

  const tokenOrchestrator = cognitoUserPoolsTokenProvider.tokenOrchestrator;
  await tokenOrchestrator.setTokens({ tokens: cognitoAuthTokens });
  return true;
}

export default function Page() {
  const [postLoginState, setPostLoginState] = useState('');
  const [user, setUser] = useState<GetCurrentUserOutput | undefined>();

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => {});
  }, [user]);
  
  
  const searchParams = useSearchParams();
  let redirectPath = searchParams.get('redirect');
  let code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!redirectPath && postLoginState) {
    const parts = postLoginState.split('-');
    if (parts.length > 1) {
      const stateData = JSON.parse(
        Buffer.from(parts[1], 'hex').toString('utf-8')
      );
      const finalRedirect = stateData['redirectPath'];
      code = '';
      redirect(`?redirect=${encodeURIComponent(finalRedirect)}`, RedirectType.replace );
    }
  }

  useEffect(() => {
    fetchAuthSession().then(sess => console.log(`auth sess ${JSON.stringify(sess)}`))
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
            .removeItem(OAUTH_PKCE_KEY).then(() => setPostLoginState(state || ''));
        }
      });
  }, [code]);

  return <>
  <div>User: {user?.username || 'No user'}</div>
  { user && redirectPath ? <Redirect /> : <AuthenticatorWrapper redirectPath={redirectPath || ''} />}
  </>;
}
