'use client';

import { type ReactNode, useEffect, useState } from 'react';
import path from 'path';
import { redirect, RedirectType } from 'next/navigation';
import { Hub } from 'aws-amplify/utils';
// https://docs.amplify.aws/gen1/react/build-a-backend/auth/add-social-provider/#required-for-multi-page-applications-complete-social-sign-in-after-redirect
import 'aws-amplify/auth/enable-oauth-listener';
import type { State } from '@/src/utils/federated-sign-in';
import content from '@/src/content/content';

export default function CIS2CallbackPage(): ReactNode {
  const [customState, setCustomState] = useState<State>();

  useEffect(() => {
    return Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'customOAuthState') {
        setCustomState(JSON.parse(payload.data));
      }
    });
  }, []);

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
