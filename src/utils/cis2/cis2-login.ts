import { decodeJWT, signInWithRedirect } from '@aws-amplify/auth';
import { AmplifyOutputs } from 'aws-amplify/adapter-core';
import { cognitoUserPoolsTokenProvider } from '@aws-amplify/auth/cognito';
import { z } from 'zod';
import { TokenResponse } from './cis2-token-retriever';

// eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module, import/no-unresolved
const amplifyOutputs: AmplifyOutputs = require('@/amplify_outputs.json');

const stateValidator = z.object({
  redirectPath: z.string().min(1),
});

export type State = {
  redirectPath: string;
};

export function stateParser(
  stateQueryParameter?: string | null
): State | undefined {
  if (!stateQueryParameter) {
    return undefined;
  }

  const parts = stateQueryParameter.split('-');
  if (parts.length <= 1) {
    return undefined;
  }

  let decodedState;
  try {
    decodedState = Buffer.from(parts[1], 'hex').toString('utf8');
  } catch {
    return undefined;
  }

  const validationResult = stateValidator.safeParse(JSON.parse(decodedState));
  if (!validationResult.success) {
    return undefined;
  }
  return validationResult.data as State;
}

export function cis2Login(redirectPath: string) {
  const providers = amplifyOutputs.auth?.oauth?.identity_providers || [];
  if (providers.length !== 1) {
    throw new Error('Missing OAUTH provider configuration');
  }
  const provider = providers[0];
  if (!provider) {
    throw new Error('Missing OAUTH custom provider configuration');
  }
  return signInWithRedirect({
    provider: {
      custom: provider,
    },
    customState: JSON.stringify({ redirectPath }),
  });
}

export async function storeTokens(
  authTokens?: TokenResponse
): Promise<boolean> {
  if (!authTokens) {
    return false;
  }

  const accessToken = decodeJWT(authTokens.access_token);
  const idToken = decodeJWT(authTokens.id_token);
  const refreshToken = authTokens.refresh_token;
  const issuedAt = accessToken.payload.iat;
  const clockDrift = issuedAt ? issuedAt * 1000 - Date.now() : 0;
  const username = accessToken.payload.sub || '';

  const cognitoAuthTokens = {
    accessToken,
    clockDrift,
    username,
    refreshToken,
    idToken,
    signInDetails: {
      loginId: username,
    },
  };

  const { tokenOrchestrator } = cognitoUserPoolsTokenProvider;
  await tokenOrchestrator.setTokens({ tokens: cognitoAuthTokens });
  return true;
}
