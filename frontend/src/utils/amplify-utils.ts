/* eslint-disable import/no-unresolved,@typescript-eslint/no-require-imports */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import { cookies } from 'next/headers';
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { FetchAuthSessionOptions, JWT } from '@aws-amplify/auth';
import { jwtDecode } from 'jwt-decode';

const config = require('@/amplify_outputs.json');

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

export const getSessionId = async () => {
  const accessToken = await getAccessTokenServer();

  if (!accessToken) {
    return;
  }

  const jwt = jwtDecode<JWT['payload']>(accessToken);

  const sessionId = jwt.origin_jti;

  if (!sessionId) {
    return;
  }

  return sessionId.toString();
};
