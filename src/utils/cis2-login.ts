import { signInWithRedirect } from '@aws-amplify/auth';
import { getConstants } from '@/src/utils/public-constants';
import { ResourcesConfig } from 'aws-amplify';
import { AmplifyOutputs } from 'aws-amplify/adapter-core';

export type State = {
  redirectPath: string;
  requestRef: string;
};

// export function stateParser(state?: string | null): State | undefined {
//     if (!state) {
//         return undefined;
//     }

//         const parts = state.split('-');
//         console.log(parts);
//         if (parts.length > 1) {
//           const stateData = JSON.parse(Buffer.from(parts[1], 'hex').toString('utf-8'));
//             console.log(`stateData ${JSON.stringify(stateData)}`);
//             redirectPath = stateData['redirectPath'];
//         }
//       }
// }

export function cis2Login(redirectPath: string, requestRef: string) {
  const provider = getConstants().CIS2_PROVIDER_NAME;
  return signInWithRedirect({
    provider: {
      custom: provider,
    },
    customState: JSON.stringify({ redirectPath, requestRef }),
  });
}

export function getCis2AmplifyConfiguration(): AmplifyOutputs {
  const {
    USER_POOL_ID,
    USER_POOL_CLIENT_ID,
    COGNITO_DOMAIN,
    REDIRECT_DOMAIN,
    CIS2_PROVIDER_NAME,
  } = getConstants();

  return {
    version: '1.3', // version is important for the framework to recognise that this type of config is AmplifyOutputs
    auth: {
      aws_region: 'eu-west-2',
      user_pool_id: USER_POOL_ID,
      user_pool_client_id: USER_POOL_CLIENT_ID,
      oauth: {
        identity_providers: [CIS2_PROVIDER_NAME],
        domain: COGNITO_DOMAIN,
        scopes: ['aws.cognito.signin.user.admin', 'email', 'openid', 'profile'],
        redirect_sign_in_uri: [REDIRECT_DOMAIN],
        redirect_sign_out_uri: [],
        response_type: 'code',
      },
    },
  };
}
