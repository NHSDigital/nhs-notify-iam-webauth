import { cookies } from 'next/headers';
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { FetchAuthSessionOptions, JWT } from '@aws-amplify/auth';
import { jwtDecode } from 'jwt-decode';

// eslint-disable-next-line @typescript-eslint/no-require-imports, import-x/no-unresolved
const config = require('@amplify_outputs');

export const { runWithAmplifyServerContext } = createServerRunner({
  config,
});

export async function getAccessTokenServer(
  options: FetchAuthSessionOptions = {}
): Promise<string | undefined> {
  const session = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (ctx) => fetchAuthSession(ctx, options),
  }).catch(() => {
    // no-op
  });

  return session?.tokens?.accessToken?.toString();
}

export const getSessionId = async (): Promise<string | undefined> => {
  const accessToken = await getAccessTokenServer();

  if (!accessToken) {
    return undefined;
  }

  const jwt = jwtDecode<JWT['payload']>(accessToken);

  const sessionId = jwt.origin_jti;

  if (!sessionId) {
    return undefined;
  }

  return sessionId.toString();
};
