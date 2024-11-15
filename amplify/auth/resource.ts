import { DeepPartialAmplifyGeneratedConfigs } from '@aws-amplify/plugin-types';
import { ClientConfig } from '@aws-amplify/client-config';
import { defineAuth } from '@aws-amplify/backend';

export const remoteAuthConfig: DeepPartialAmplifyGeneratedConfigs<ClientConfig> =
  {
    auth: {
      aws_region: 'eu-west-2',
      user_pool_id: process.env.USER_POOL_ID,
      user_pool_client_id: process.env.USER_POOL_CLIENT_ID,
    },
  };

export const sandboxAuthConfig = {
  auth: defineAuth({
    loginWith: {
      email: true,
    },
  }),
};
