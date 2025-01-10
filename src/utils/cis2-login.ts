import { signInWithRedirect } from '@aws-amplify/auth';
import { getConstants } from '@/src/utils/public-constants';
import { ResourcesConfig } from 'aws-amplify';

export function cis2Login(redirectPath: string) {
  const provider = getConstants().CIS2_PROVIDER_NAME;
  return signInWithRedirect({
    provider: {
      custom: provider,
    },
    customState: JSON.stringify({ redirectPath }),
  });
}

export function getCis2AmplifyConfiguration(): ResourcesConfig {
  const {
    USER_POOL_ID,
    USER_POOL_CLIENT_ID,
    COGNITO_DOMAIN,
    REDIRECT_DOMAIN,
    CIS2_PROVIDER_NAME,
  } = getConstants();
  
  return {
    Auth: {
      Cognito: {
        userPoolId: USER_POOL_ID,
        userPoolClientId: USER_POOL_CLIENT_ID,
        loginWith: {
          oauth: {
            domain: COGNITO_DOMAIN,
            scopes: [
              'aws.cognito.signin.user.admin',
              'email',
              'openid',
              'profile',
            ],
            redirectSignIn: [REDIRECT_DOMAIN],
            redirectSignOut: [],
            responseType: 'code',
            providers: [{ custom: CIS2_PROVIDER_NAME }],
          },
        },
      },
    },
  };
}
