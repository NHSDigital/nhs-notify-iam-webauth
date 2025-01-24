'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { Redirect } from '@/src/components/molecules/Redirect/Redirect';
import { redirect, RedirectType, useSearchParams } from 'next/navigation';
import { cis2Login, State } from '@/src/utils/cis2/cis2-login';
import { CIS2LoginButton } from '@/src/components/CIS2LoginButton/CIS2LoginButton';
import { Hub } from 'aws-amplify/utils';

const AuthenticatorWrapper = () => {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  return withAuthenticator(Redirect, {
    variation: 'default',
    hideSignUp: true,
    components: {
      SignIn: {
        Header: () => (
          <div
            style={{
              marginTop: '2.0rem',
              marginBottom: 0,
              marginLeft: '2.0rem',
            }}
          >
            <CIS2LoginButton
              onClick={() => cis2Login(redirectPath || '/home')}
            />
          </div>
        ),
      },
    },
  })({});
};

export default function Page() {
  const [customState, setCustomState] = useState<State>();

  if (customState) {
    redirect(
      `?redirect=${encodeURIComponent(customState.redirectPath || '/home')}`,
      RedirectType.replace
    );
  }

  useEffect(() => {
    return Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'customOAuthState') {
        setCustomState(JSON.parse(payload.data));
      }
    });
  }, []);

  return (
    <Suspense>
      <AuthenticatorWrapper />
    </Suspense>
  );
}
