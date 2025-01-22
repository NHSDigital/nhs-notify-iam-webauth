// Hard to avoid due to FetchInterceptor using any
/* eslint @typescript-eslint/no-explicit-any: 0 */
import { FetchInterceptor } from 'fetch-intercept';
import { generateClientSecretHash } from '@/src/utils/basic-auth/client-secret-handler';
import { fetchAuthSession } from '@aws-amplify/auth';
import axios from 'axios';

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

    let usernameSupplier: Promise<string>;

    if (username) {
      console.log(`Got username ${username} from payload for target ${target}`);
      usernameSupplier = Promise.resolve(username);
    } else {
      console.log(`Getting username from cookies for target ${target}`);
      usernameSupplier = fetchAuthSession({ forceRefresh: false }).then(
        (session) => {
          console.log(`session.userSub ${session.userSub}`);
          if (!session.userSub) {
            throw new Error('Cannot determine username');
          }
          return session.userSub;
        }
      );

      return axios
        .get(
          'https://timeapi.io/api/time/current/zone?timeZone=Europe%2FAmsterdam'
        )
        .then((result) => {
          console.log(`Got result ${result.status}, ${result.data}`);
          targetConfig.injectSecretHash(body, 'REDACTED');
          config.body = JSON.stringify(body);
          return [url, config];
        });
    }

    return usernameSupplier.then((un) => {
      console.log(`un ${un}`);
      return generateClientSecretHash(un).then((secretHash) => {
        console.log(`secretHash ${!!secretHash}`);
        targetConfig.injectSecretHash(body, secretHash);
        config.body = JSON.stringify(body);
        return [url, config];
      });
    });
  },
};
