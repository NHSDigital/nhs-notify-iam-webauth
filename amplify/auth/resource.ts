import { DeepPartialAmplifyGeneratedConfigs } from '@aws-amplify/plugin-types';
import { ClientConfig } from '@aws-amplify/client-config';

const appId = process.env.AWS_APP_ID;
const subdomain = process.env.NOTIFY_SUBDOMAIN;
const domainName = process.env.NOTIFY_DOMAIN_NAME;

export const authConfig: DeepPartialAmplifyGeneratedConfigs<ClientConfig> = {
  auth: {
    aws_region: 'eu-west-2',
    user_pool_id: process.env.USER_POOL_ID,
    user_pool_client_id: process.env.USER_POOL_CLIENT_ID,
    oauth: {
      identity_providers: [],
      domain: process.env.HOSTED_LOGIN_DOMAIN ?? 'no-domain',
      scopes: [
        'openid',
        'email',
        'profile',
        'phone',
        'aws.cognito.signin.user.admin',
      ],
      redirect_sign_in_uri: [
        `https://${subdomain}.${appId}.amplifyapp.com/auth/`,
        `https://${subdomain}.${domainName}/auth/`,
        'http://localhost:3000/auth/',
        'http://localhost/auth/',
      ],
      redirect_sign_out_uri: [
        `https://${subdomain}.${appId}.amplifyapp.com/`,
        `https://${subdomain}.${domainName}/`,
        'http://localhost:3000/templates/create-and-submit',
        'http://localhost/templates/create-and-submit',
      ],
      response_type: 'code',
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
    },
  },
};
