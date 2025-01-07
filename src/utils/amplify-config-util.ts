import { Amplify, ResourcesConfig } from 'aws-amplify';
import {
  CIS2_PROVIDER_NAME,
  COGNITO_DOMAIN,
  REDIRECT_DOMAIN,
  USER_POOL_CLIENT_ID,
  USER_POOL_ID,
} from './constants';

// eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module, import/no-unresolved
const amplifyOutputs = require('@/amplify_outputs.json');

console.log(amplifyOutputs);

export function configureAmplify() {
  const authConfig: ResourcesConfig = {
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
  Amplify.configure({ ...amplifyOutputs }, { ssr: true });
}
