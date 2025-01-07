'use client';

import React, { Suspense } from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { postLoginRedirect } from '@/src/components/molecules/Redirect/Redirect';
import fetchIntercept, { FetchInterceptor } from 'fetch-intercept';
import { generateClientSecretHash } from './client-secret-handler';

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

const fetchInterceptTargets = new Set([
  'AWSCognitoIdentityProviderService.InitiateAuth',
  'AWSCognitoIdentityProviderService.RespondToAuthChallenge',
]);

const interceptor: FetchInterceptor = {
  request: (url: string, config: any) => {
    if (!config?.headers) {
      return [url, config];
    }
    console.log(config.headers);

    const target = config.headers['x-amz-target'] || '';
    if (!fetchInterceptTargets.has(target)) {
      return [url, config];
    }
    const body = JSON.parse(config.body);

    let username = '';
    if (target === 'AWSCognitoIdentityProviderService.InitiateAuth') {
      username = body.AuthParameters.USERNAME;
    } else if (
      target === 'AWSCognitoIdentityProviderService.RespondToAuthChallenge'
    ) {
      username = body.ChallengeResponses.USERNAME;
    }

    return generateClientSecretHash(username).then((secretHash) => {
      if (target === 'AWSCognitoIdentityProviderService.InitiateAuth') {
        body.AuthParameters.SECRET_HASH = secretHash;
      } else if (
        target === 'AWSCognitoIdentityProviderService.RespondToAuthChallenge'
      ) {
        body.ChallengeResponses.SECRET_HASH = secretHash;
      }

      config.body = JSON.stringify(body);

      return [url, config];
    });
  },
};

fetchIntercept.register(interceptor);

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AuthenticatorWrapper />
    </Suspense>
  );
}
