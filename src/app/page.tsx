'use client';

import React, { Suspense, useEffect } from 'react';
import path from 'path';
import { redirect, RedirectType, useSearchParams } from 'next/navigation';
import { Hub } from 'aws-amplify/utils';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { federatedSignIn, State } from '@/src/utils/federated-sign-in';
import { CIS2SignInButton } from '@/src/components/CIS2SignInButton/CIS2SignInButton';
import content from '@/src/content/content';
import styles from './page.module.scss';

function SignInPage() {
  const {
    pages: { signInPage: pageContent },
  } = content;
  const searchParams = useSearchParams();

  const redirectPath = searchParams.get('redirect');

  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

  useEffect(() => {
    return Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'customOAuthState') {
        const customState: State = JSON.parse(payload.data);

        redirect(
          path.normalize(`/redirect/${customState.redirectPath || '/home'}`),
          RedirectType.replace
        );
      }
    });
  }, []);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      redirect(
        path.normalize(`/redirect/${redirectPath || '/home'}`),
        RedirectType.replace
      );
    }
  }, [authStatus, redirectPath]);

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
            <div
              className={`nhsuk-u-padding-6 notify-content ${styles['notify-cognito-sign-in-form']}`}
            >
              <h2 className='nhsuk-heading-m'>
                {content.components.cognitoSignInComponent.heading}
              </h2>
              <Authenticator variation='default' hideSignUp />
            </div>
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
