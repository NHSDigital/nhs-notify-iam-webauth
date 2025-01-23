'use client';

import React, { useEffect, useState } from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { Redirect } from '@/src/components/molecules/Redirect/Redirect';
import { Button } from 'nhsuk-react-components';
import { redirect, RedirectType, useSearchParams } from 'next/navigation';
import { cis2Login, State } from '@/src/utils/cis2/cis2-login';
import { Hub } from '@aws-amplify/core';
import { CIS2LoginButton } from '@/src/components/CIS2LoginButton/CIS2LoginButton';
import { getCurrentUser } from '@aws-amplify/auth';

const AuthenticatorWrapper = (props: { redirectPath: string }) => {
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
              onClick={() => cis2Login(props.redirectPath)}
            ></CIS2LoginButton>
          </div>
        ),
      },
    },
  })({});
};

export default function Page() {
  const [customState, setCustomState] = useState<State>();

  useEffect(() => {
    return Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'customOAuthState':
          setCustomState(JSON.parse(payload.data));
      }
    });
  }, []);

  const searchParams = useSearchParams();
  let redirectPath = searchParams.get('redirect');

  if (customState) {
    redirect(
      `?redirect=${encodeURIComponent(customState.redirectPath || '/home')}`,
      RedirectType.replace
    );
  }

  return <AuthenticatorWrapper redirectPath={redirectPath || ''} />;
}
