'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { redirect, RedirectType, useSearchParams } from 'next/navigation';
import { Hub } from 'aws-amplify/utils';
import { federatedSignIn, State } from '@/src/utils/federated-sign-in';
import { CIS2SignInButton } from '@/src/components/CIS2SignInButton/CIS2SignInButton';
import { CognitoSignInForm } from '@/src/components/CognitoSignInForm/CognitoSignInForm';
import content from '@/src/content/content';

function SignInPage() {
  const {
    pages: { signInPage: pageContent },
  } = content;
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
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-two-thirds'>
        <h1 className='nhsuk-heading-xl'>{pageContent.pageHeading}</h1>
        <div className='nhsuk-u-padding-6 notify-content'>
          <h2 className='nhsuk-heading-m'>
            {pageContent.federatedSignInSectionHeading}
          </h2>
          <CIS2SignInButton
            onClick={() => federatedSignIn(redirectPath || '/home')}
          />
        </div>
        {process.env.NEXT_PUBLIC_ENABLE_COGNITO_IDP === 'true' && (
          <>
            <hr className='nhsuk-section-break nhsuk-section-break--m' />
            <CognitoSignInForm />
          </>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <SignInPage />
    </Suspense>
  );
}
