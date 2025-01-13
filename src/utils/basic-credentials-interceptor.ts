// Hard to avoid due to FetchInterceptor using any
/* eslint @typescript-eslint/no-explicit-any: 0 */
import { FetchInterceptor } from 'fetch-intercept';
import { generateClientSecretHash } from '@/src/utils/client-secret-handler';

type TargetConfig = {
  extractUsername: (body: any) => string;
  injectSecretHash: (body: any, secretHash: string) => void;
};

const targetConfigs: Record<string, TargetConfig> = {
  'AWSCognitoIdentityProviderService.InitiateAuth': {
    extractUsername: (body: any) => body.AuthParameters.USERNAME,
    injectSecretHash: (body: any, secretHash: string) => {
      body.AuthParameters.SECRET_HASH = secretHash;
    },
  },
  'AWSCognitoIdentityProviderService.RespondToAuthChallenge': {
    extractUsername: (body: any) => body.ChallengeResponses.USERNAME,
    injectSecretHash: (body: any, secretHash: string) => {
      body.ChallengeResponses.SECRET_HASH = secretHash;
    },
  },
};

export const basicCredentialsInterceptor: FetchInterceptor = {
  request: (url: string, config: any) => {
    if (!config?.headers) {
      return [url, config];
    }

    if (config?.method !== 'POST') {
      return [url, config];
    }

    const target = config.headers['x-amz-target'] || '';
    const targetConfig = targetConfigs[target];
    if (!targetConfig) {
      return [url, config];
    }

    const body = JSON.parse(config.body);
    const username = targetConfig.extractUsername(body);

    return generateClientSecretHash(username).then((secretHash) => {
      targetConfig.injectSecretHash(body, secretHash);
      config.body = JSON.stringify(body);
      return [url, config];
    });
  },
};
