'use client';

import React, { Suspense, useEffect } from 'react';
import { RedirectType, redirect, useSearchParams } from 'next/navigation';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import JsCookie from 'js-cookie';
// eslint-disable-next-line unicorn/prefer-node-protocol
import path from 'path';
import { authenticatorSelector } from '@/utils/authenticator-selector';
import { federatedSignIn } from '@/utils/federated-sign-in';
import CIS2SignInButton from '@/components/CIS2SignInButton/CIS2SignInButton';
import content from '@/content/content';
import styles from '@/app/page.module.scss';

function SignIn() {
  const {
    pages: { signInPage: pageContent },
  } = content;

  const { authStatus } = useAuthenticator(authenticatorSelector);

  const searchParams = useSearchParams();

  const redirectPath = searchParams.get('redirect');

  useEffect(() => {
    if (authStatus === 'authenticated') {
      redirect(
        path.normalize(
          `/signin?redirect=${encodeURIComponent(redirectPath ?? '/templates/message-templates')}`
        ),
        RedirectType.push
      );
    } else if (authStatus === 'unauthenticated') {
      JsCookie.remove('csrf_token');
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
            onClick={() =>
              federatedSignIn(redirectPath ?? '/templates/message-templates')
            }
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

export default function SignInPage() {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  );
}
