import { useAuthenticator } from '@aws-amplify/ui-react';

type UseAuthenticatorSelector = Exclude<
  Parameters<typeof useAuthenticator>[0],
  undefined
>;

export const authenticatorSelector: UseAuthenticatorSelector = (ctx) => [
  ctx.authStatus,
  ctx.error,
];
