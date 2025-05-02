'use client';

import { type ReactNode, useEffect } from 'react';
import path from 'path';
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from 'next/navigation';
// https://docs.amplify.aws/gen1/react/build-a-backend/auth/add-social-provider/#required-for-multi-page-applications-complete-social-sign-in-after-redirect
import 'aws-amplify/auth/enable-oauth-listener';
import { getCurrentUser } from '@aws-amplify/auth';
import type { State } from '@/src/utils/federated-sign-in';
import content from '@/src/content/content';
import { LoadingSpinner } from '@/src/components/LoadingSpinner/LoadingSpinner';

const POLLING_INTERVAL_MS = 25;
const MAX_POLL_ATTEMPTS = 240;

function redirectFromStateQuery(searchParams: ReadonlyURLSearchParams): State {
  const stateQuery = searchParams.get('state');
  const redirectSegment = stateQuery?.split('-')?.[1];
  const json = Buffer.from(redirectSegment ?? '', 'hex').toString('utf8');

  try {
    return JSON.parse(json);
  } catch {
    return { redirectPath: '/templates/message-templates' };
  }
}

export default function CIS2CallbackPage(): ReactNode {
  const router = useRouter();
  const customState = redirectFromStateQuery(useSearchParams());
  const destination = path.normalize(
    `/signin?redirect=${encodeURIComponent(customState.redirectPath)}`
  );

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const pollForUser = async (attempt: number) => {
      if (attempt >= MAX_POLL_ATTEMPTS) {
        router.replace(destination);
        return;
      }

      try {
        await getCurrentUser();
        router.replace(destination);
      } catch {
        timeout = setTimeout(
          () => pollForUser(attempt + 1),
          POLLING_INTERVAL_MS
        );
      }
    };

    pollForUser(0);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [router, destination]);

  return <LoadingSpinner text={content.pages.oauth2Redirect.heading} />;
}
