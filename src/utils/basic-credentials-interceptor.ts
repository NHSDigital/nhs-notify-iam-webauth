// Hard to avoid due to FetchInterceptor using any
/* eslint @typescript-eslint/no-explicit-any: 0 */
import { FetchInterceptor } from 'fetch-intercept';
import { generateClientSecretHash } from './client-secret-handler';

const TARGET_INITIATE = 'AWSCognitoIdentityProviderService.InitiateAuth';
const TARGET_RESPONSE_TO_CHALLENGE =
  'AWSCognitoIdentityProviderService.RespondToAuthChallenge';

const fetchInterceptTargets = new Set([
  TARGET_INITIATE,
  TARGET_RESPONSE_TO_CHALLENGE,
]);

function extractUsername(target: string, body: any): string {
  if (target === TARGET_INITIATE) {
    return body.AuthParameters.USERNAME;
  }
  if (target === TARGET_RESPONSE_TO_CHALLENGE) {
    return body.ChallengeResponses.USERNAME;
  }
  return '';
}

function injectSecretHash(target: string, body: any, secretHash: string): any {
  if (target === TARGET_INITIATE) {
    body.AuthParameters.SECRET_HASH = secretHash;
  } else if (target === TARGET_RESPONSE_TO_CHALLENGE) {
    body.ChallengeResponses.SECRET_HASH = secretHash;
  }
  return body;
}

export const basicCredentialsInterceptor: FetchInterceptor = {
  request: (url: string, config: any) => {
    if (!config?.headers) {
      return [url, config];
    }

    const target = config.headers['x-amz-target'] || '';
    if (!fetchInterceptTargets.has(target)) {
      return [url, config];
    }

    const body = JSON.parse(config.body);
    const username = extractUsername(target, body);

    return generateClientSecretHash(username).then((secretHash) => {
      const updatedBody = injectSecretHash(target, body, secretHash);
      config.body = JSON.stringify(updatedBody);
      return [url, config];
    });
  },
};
