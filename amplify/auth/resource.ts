import { DeepPartialAmplifyGeneratedConfigs } from '@aws-amplify/plugin-types';
import { ClientConfig } from '@aws-amplify/client-config';

const userPoolId = process.env.USER_POOL_ID!;
const userPoolClientId = process.env.USER_POOL_CLIENT_ID ?? '67ts78qj65gn6l68kvae5gbcor'; // temporary hardcoded ID, remove once we can deploy the app
const hostedLoginDomain = process.env.HOSTED_LOGIN_DOMAIN!;

const appId = process.env.AWS_APP_ID!;
const group = process.env.NOTIFY_GROUP!;
const subdomain = process.env.NOTIFY_SUBDOMAIN!;
const domainName = process.env.NOTIFY_DOMAIN_NAME!;

export const authConfig: DeepPartialAmplifyGeneratedConfigs<ClientConfig> = {
  auth: {
    aws_region: 'eu-west-2',
    user_pool_id: userPoolId,
    user_pool_client_id: userPoolClientId,
    oauth: {
      'identity_providers': [],
      'domain': hostedLoginDomain,
      'scopes': [
        'openid',
        'email',
        'profile',
        'phone',
        'aws.cognito.signin.user.admin'
      ],
      'redirect_sign_in_uri': [
        `https://${subdomain}.${appId}.amplifyapp.com/auth/`,
        `https://${subdomain}.${domainName}/auth/`,
        ...(group === 'nonprod' ? ['http://localhost:3000/auth/']: [])
      ],
      'redirect_sign_out_uri': [
        `https://${subdomain}.${appId}.amplifyapp.com/`,
        `https://${subdomain}.${domainName}/`,
        ...(group === 'nonprod' ? ['http://localhost:3000/']: [])
      ],
      'response_type': 'code'
    },
    username_attributes: ['email'],
    standard_required_attributes: ['email'],
    user_verification_types: ['email'],
    unauthenticated_identities_enabled: false,
    password_policy: {
      min_length: 8,
      require_lowercase: true,
      require_uppercase: true,
      require_numbers: true,
      require_symbols: true,
    }
  }
};
