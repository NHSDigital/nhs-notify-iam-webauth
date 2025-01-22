'use client';

import React, { useEffect, useState } from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { Redirect } from '@/src/components/molecules/Redirect/Redirect';
import fetchIntercept from 'fetch-intercept';
import { basicCredentialsInterceptor } from '@/src/utils/basic-auth/basic-credentials-interceptor';
import { Button } from 'nhsuk-react-components';
import { redirect, RedirectType, useSearchParams } from 'next/navigation';
import {
  cis2Login,
  stateParser,
  storeTokens,
} from '@/src/utils/cis2/cis2-login';
import {
  cognitoCredentialsProvider,
  cognitoUserPoolsTokenProvider,
  getCurrentUser,
  GetCurrentUserOutput,
} from '@aws-amplify/auth/cognito';
import { Amplify } from 'aws-amplify';
import { defaultStorage } from 'aws-amplify/utils';
import { getAuthTokens } from '@/src/utils/cis2/cis2-token-retriever';
import { AuthTokens } from '@aws-amplify/auth';
import { AuthConfig } from '@aws-amplify/core';
import { generateClientSecretHash } from '../utils/basic-auth/client-secret-handler';
import axios from 'axios';

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

fetchIntercept.register(basicCredentialsInterceptor);

// export type CognitoAuthTokens = AuthTokens & {
//   refreshToken?: string;
//   clockDrift: number;
//   username: string;
// };

// type TokenRefreshOptions = {
//   tokens: CognitoAuthTokens;
//   authConfig?: AuthConfig;
//   username: string;
// };

// const tokenRefresher = ({ tokens, authConfig, username, }: TokenRefreshOptions) => Promise<CognitoAuthTokens>

// const tokenRefresher = (options: TokenRefreshOptions) => {
//   console.log(`Custom token refresher ${options.username}`);
//   return generateClientSecretHash(options.username).then(secretHash => {
//     console.log(`Got secret ${secretHash}`);
//     return axios.post('https://cognito-idp.eu-west-2.amazonaws.com/', {
//       AuthFlow: 'REFRESH_TOKEN_AUTH',
//       ClientId: options.authConfig?.Cognito.userPoolClientId,
//       AuthParameters: {
//         REFRESH_TOKEN: options.tokens.refreshToken,
//         SECRET_HASH: secretHash
//       }
//     }).then(result => {
//       console.log(`Refresh response code ${result.status}`);
//       console.log(`Refresh data ${result.data}`);
//       return {
//       } as CognitoAuthTokens;
//     })
//   })
// };

// cognitoUserPoolsTokenProvider.tokenOrchestrator.setTokenRefresher(tokenRefresher);

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
  }, [code, postLoginState]);

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
