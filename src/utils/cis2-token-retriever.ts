'use server';

import axios from 'axios';
import { getServerConstants } from './public-constants';

type TokenResponse = {
    id_token: string,
    access_token: string,
    refresh_token: string,
    expires_in: number,
    token_type: 'Bearer'
} 

export async function getAuthTokens(
  code: string,
  codeVerifier: string
): Promise<any> {
  const { USER_POOL_CLIENT_ID, USER_POOL_CLIENT_SECRET, COGNITO_DOMAIN, REDIRECT_DOMAIN } =
    getServerConstants();

  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('client_id', USER_POOL_CLIENT_ID);
  params.append('redirect_uri', REDIRECT_DOMAIN);
  params.append('code_verifier', codeVerifier);

  const response = await axios.post<TokenResponse>(
    `https://${COGNITO_DOMAIN}/oauth2/token`,
    params,
    {
      auth: {
        username: USER_POOL_CLIENT_ID,
        password: USER_POOL_CLIENT_SECRET,
      },
    }
  );
  return response.data;
}
