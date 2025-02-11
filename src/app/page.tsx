'use client';

import React, { Suspense, useEffect } from 'react';
import { redirect, RedirectType, useSearchParams } from 'next/navigation';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import path from 'path';
import { federatedSignIn } from '@/src/utils/federated-sign-in';
import { CIS2SignInButton } from '@/src/components/CIS2SignInButton/CIS2SignInButton';
import content from '@/src/content/content';
import styles from './page.module.scss';

function SignInPage() {
  const {
    pages: { signInPage: pageContent },
  } = content;

  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

  const searchParams = useSearchParams();

  const redirectPath = searchParams.get('redirect');

  useEffect(() => {
    if (authStatus === 'authenticated') {
      redirect(
        path.normalize(redirectPath ? `/signin/${redirectPath}` : '/home'),
        RedirectType.push
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
