'use server';

import axios from 'axios';
import { Amplify } from 'aws-amplify';

export type TokenResponse = {
  id_token: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
};

// eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module, import/no-unresolved
Amplify.configure(require('@/amplify_outputs.json'), { ssr: true });

export async function getAuthTokens(
  code: string,
  codeVerifier: string
): Promise<TokenResponse | undefined> {
  if (!code || !codeVerifier) {
    return;
  }

  const amplifyConfig = Amplify.getConfig();

  const cognitoConfig = amplifyConfig.Auth?.Cognito;
  const userPoolClientId = cognitoConfig?.userPoolClientId || '';
  const redirectDomain = (cognitoConfig?.loginWith?.oauth?.redirectSignIn ||
    [])[0];
  const cognitoDomain = cognitoConfig?.loginWith?.oauth?.domain;

  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('client_id', userPoolClientId);
  params.append('redirect_uri', redirectDomain);
  params.append('code_verifier', codeVerifier);

  const response = await axios.post<TokenResponse>(
    `https://${cognitoDomain}/oauth2/token`,
    params,
    {
      auth: {
        username: userPoolClientId,
        password: process.env.USER_POOL_CLIENT_SECRET || '',
      },
    }
  );
  return response.data;
}
