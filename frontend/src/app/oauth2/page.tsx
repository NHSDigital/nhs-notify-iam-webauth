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
import { noClientErrorTag } from '@/utils/public-constants';

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
  const searchParams = useSearchParams();
  const customState = redirectFromStateQuery(searchParams);
  const destination = `/signin?redirect=${encodeURIComponent(customState.redirectPath)}`;

  const error = searchParams.get('error_description');

  useEffect(() => {
    if (error === noClientErrorTag) {
      return router.replace(content.pages.oauth2Redirect.noClientRedirectHref);
    }

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
  }, [router, destination, error]);

  return <LoadingSpinner text={content.pages.oauth2Redirect.heading} />;
}
