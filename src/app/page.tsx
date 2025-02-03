'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { redirect, RedirectType, useSearchParams } from 'next/navigation';
import { Hub } from 'aws-amplify/utils';
import { federatedSignIn, State } from '@/src/utils/federated-sign-in';
import { CIS2LoginButton } from '@/src/components/CIS2LoginButton/CIS2LoginButton';

export default function Page() {
  const [customState, setCustomState] = useState<State>();
  const searchParams = useSearchParams();

  const redirectPath = searchParams.get('redirect');

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
      <div className='nhsuk-grid-row'>
        <div className='nhsuk-grid-column-two-thirds'>
          <h1 className='nhsuk-heading-xl'>Sign in</h1>
          <div className='nhsuk-u-padding-6 notify-content'>
            <h2 className='nhsuk-heading-m'>Sign in using an NHS account</h2>
            <CIS2LoginButton
              onClick={() => federatedSignIn(redirectPath || '/home')}
            />
          </div>
        </div>
      </div>
    </Suspense>
  );
}
