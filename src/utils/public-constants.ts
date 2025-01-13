// client and server
export const getConstants: () => Record<string, string> = () => ({
  BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH ?? '/auth',
  USER_POOL_ID: process.env.NEXT_PUBLIC_USER_POOL_ID || '',
  USER_POOL_CLIENT_ID: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || '',
  COGNITO_DOMAIN: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || '',
  REDIRECT_DOMAIN: process.env.NEXT_PUBLIC_REDIRECT_DOMAIN || '',
  CIS2_PROVIDER_NAME: process.env.NEXT_PUBLIC_CIS2_PROVIDER_NAME || '',
});

export const getServerConstants: () => Record<string, string> = () => ({
  ...getConstants(),
  ...{ USER_POOL_CLIENT_SECRET: process.env.USER_POOL_CLIENT_SECRET || '' },
});
