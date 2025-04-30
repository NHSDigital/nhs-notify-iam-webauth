'use client';

import { type ReactNode, useEffect, useState } from 'react';
import path from 'path';
import { redirect, RedirectType, useSearchParams } from 'next/navigation';
import { Hub } from 'aws-amplify/utils';
// https://docs.amplify.aws/gen1/react/build-a-backend/auth/add-social-provider/#required-for-multi-page-applications-complete-social-sign-in-after-redirect
import 'aws-amplify/auth/enable-oauth-listener';
import { getCurrentUser } from '@aws-amplify/auth';
import type { State } from '@/src/utils/federated-sign-in';
import content from '@/src/content/content';

export default function CIS2CallbackPage(): ReactNode {
  const [customState, setCustomState] = useState<State>();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log('useeffect');

    const check = async () => {
      try {
        const user = await getCurrentUser();
        console.log('user', user);
        if (user) {
          const x = searchParams.get('state')?.split('-')[1];
          const decoded = Buffer.from(x || '', 'hex').toString('utf8');
          setCustomState(JSON.parse(decoded));
        } else {
          setTimeout(check, 1000);
        }
      } catch (error) {
        console.log(error);
        setTimeout(check, 1000);
      }
    };

    check();

    // return Hub.listen('auth', ({ payload }) => {
    //   console.log('!!!!!!!!!!!!!!!!', payload);
    //   const x = searchParams.get('state')?.split('-')[1];
    //   const decoded = Buffer.from(x || '', 'hex').toString('utf8');
    //   console.log(decoded);

    //   if (payload.event === 'customOAuthState') {
    //     setCustomState(JSON.parse(payload.data));
    //   }
    // });
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
