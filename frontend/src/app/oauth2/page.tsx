'use client';

import { type ReactNode, useEffect } from 'react';
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from 'next/navigation';
// https://docs.amplify.aws/gen1/react/build-a-backend/auth/add-social-provider/#required-for-multi-page-applications-complete-social-sign-in-after-redirect
import 'aws-amplify/auth/enable-oauth-listener';
import { getCurrentUser } from '@aws-amplify/auth';
import type { State } from '@/utils/federated-sign-in';
import content from '@/content/content';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';

const POLLING_INTERVAL_MS = 500;
const MAX_POLL_DURATION_MS = 20_000;

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

// eslint-disable-next-line sonarjs/function-return-type
export default function CIS2CallbackPage(): ReactNode {
  const router = useRouter();
  const customState = redirectFromStateQuery(useSearchParams());
  const destination = `/signin?redirect=${encodeURIComponent(customState.redirectPath)}`;

  useEffect(() => {
    const startTime = Date.now();

    const timeout: NodeJS.Timeout = setInterval(async () => {
      try {
        await getCurrentUser();
        clearInterval(timeout);
        router.replace(destination);
       // eslint-disable-next-line no-empty
      } catch {}

      const elapsed = Date.now() - startTime;
      if (elapsed > MAX_POLL_DURATION_MS) {
        clearInterval(timeout);
        router.replace(destination);
      }
    }, POLLING_INTERVAL_MS);

    return () => {
      clearInterval(timeout);
    };
  }, [router, destination]);

  return <LoadingSpinner text={content.pages.oauth2Redirect.heading} />;
}
