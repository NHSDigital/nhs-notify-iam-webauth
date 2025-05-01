'use client';

import { type ReactNode, useEffect, useState } from 'react';
import path from 'path';
import {
  ReadonlyURLSearchParams,
  redirect,
  RedirectType,
  useSearchParams,
} from 'next/navigation';
import { Hub } from 'aws-amplify/utils';
// https://docs.amplify.aws/gen1/react/build-a-backend/auth/add-social-provider/#required-for-multi-page-applications-complete-social-sign-in-after-redirect
import 'aws-amplify/auth/enable-oauth-listener';
import { getCurrentUser } from '@aws-amplify/auth';
import type { State } from '@/src/utils/federated-sign-in';
import content from '@/src/content/content';

async function redirectFromStateQuery(searchParams: ReadonlyURLSearchParams) {
  const stateQuery = await searchParams.get('state');
  const redirectSegment = stateQuery?.split('-')?.[0];
  const json = Buffer.from(redirectSegment ?? '', 'hex').toString('utf8');

  try {
    return JSON.parse(json);
  } catch {
    return { redirectPath: '/templates/message-templates' };
  }
}

export default function CIS2CallbackPage(): ReactNode {
  const [customState, setCustomState] = useState<State>();
  const searchParams = useSearchParams();

  useEffect(() => {
    let clearListener: ReturnType<typeof Hub.listen> | null = null;

    (async () => {
      const redirectQuery = await redirectFromStateQuery(searchParams);

      clearListener = Hub.listen('auth', ({ payload }) => {
        if (
          payload.event === 'customOAuthState' ||
          payload.event === 'signInWithRedirect'
        ) {
          setCustomState(redirectQuery);
        }
      });
    })();

    if (clearListener) {
      return clearListener;
    }
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      const redirectQuery = await redirectFromStateQuery(searchParams);

      const pollForUser = async () => {
        try {
          const user = await getCurrentUser();
          if (user) {
            setCustomState(redirectQuery);
          } else {
            setTimeout(pollForUser, 200);
          }
        } catch {
          setTimeout(pollForUser, 200);
        }
      };

      pollForUser();
    })();
  }, [searchParams]);

  if (customState) {
    redirect(
      path.normalize(
        `/signin?redirect=${encodeURIComponent(customState.redirectPath ?? '/templates/message-templates')}`
      ),
      RedirectType.replace
    );
  }

  return <h1>{content.pages.oauth2Redirect.heading}</h1>;
}
