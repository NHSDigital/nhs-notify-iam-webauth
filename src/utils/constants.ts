// client and server
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '/auth';
export const USER_POOL_ID = process.env.NEXT_PUBLIC_USER_POOL_ID || '';
export const USER_POOL_CLIENT_ID =
  process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || '';
export const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || '';
export const REDIRECT_DOMAIN = process.env.NEXT_PUBLIC_REDIRECT_DOMAIN || '';
export const CIS2_PROVIDER_NAME =
  process.env.NEXT_PUBLIC_CIS2_PROVIDER_NAME || '';

