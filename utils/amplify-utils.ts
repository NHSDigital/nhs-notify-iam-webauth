import { cookies } from 'next/headers';

import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import { fetchAuthSession, fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth/server';
import outputs from '../amplify_outputs.json';

export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
});

export async function AuthGetCurrentUserServer() {
  try {
    return await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: async (contextSpec) => {
        const currentUser = await getCurrentUser(contextSpec);
        console.log({ currentUser });

        // const session = await fetchAuthSession(contextSpec);
        // console.log({ session })
        const attributes = await fetchUserAttributes(contextSpec);
        console.log({ attributes });
        return { currentUser, attributes };
      }
    });
  } catch (error) {
    console.error(error);
  }
}
