// client and server
export const getConstants: () => Record<string, string> = () => ({
  BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH ?? '/auth',
  USER_POOL_ID: process.env.NEXT_PUBLIC_USER_POOL_ID || '',
  USER_POOL_CLIENT_ID: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || '',
  COGNITO_DOMAIN: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || '',
  REDIRECT_DOMAIN: process.env.NEXT_PUBLIC_REDIRECT_DOMAIN || '',
  CIS2_PROVIDER_NAME: process.env.NEXT_PUBLIC_CIS2_PROVIDER_NAME || '',
  TIME_TILL_LOGOUT_SECONDS:
    process.env.NEXT_PUBLIC_TIME_TILL_LOGOUT_SECONDS || '900',
});

export const noClientErrorTag = 'PRE_AUTH_NO_CLIENT_FAILURE';
