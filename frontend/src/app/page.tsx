'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { RedirectType, redirect, useSearchParams } from 'next/navigation';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import JsCookie from 'js-cookie';
// this is not node:path, this is an npm module
// eslint-disable-next-line unicorn/prefer-node-protocol
import path from 'path';
import { authenticatorSelector } from '@/utils/authenticator-selector';
import { federatedSignIn } from '@/utils/federated-sign-in';
import CIS2SignInButton from '@/components/CIS2SignInButton/CIS2SignInButton';
import content from '@/content/content';
import styles from '@/app/page.module.scss';
import { noClientErrorTag } from '@/utils/public-constants';
import { fetchAuthSession } from '@aws-amplify/auth';

function SignIn() {
  const {
    pages: { signInPage: pageContent },
  } = content;

  const { authStatus, error } = useAuthenticator(authenticatorSelector);

  const searchParams = useSearchParams();

  const redirectPath = searchParams.get('redirect');

  const [sessionValidated, setSessionValidated] = useState(false);

  useEffect(() => {
    // Force Amplify to validate the session against Cognito
    const validateSession = async () => {
      try {
        await fetchAuthSession({ forceRefresh: true });
      } catch {
        // Session is invalid, Amplify will update authStatus
      } finally {
        setSessionValidated(true);
      }
    };

    validateSession();
  }, []);

  useEffect(() => {
    if (sessionValidated) {
      if (error && error.includes(noClientErrorTag)) {
        redirect(pageContent.noClientRedirectHref, RedirectType.push);
      }

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
    }
  }, [
    sessionValidated,
    authStatus,
    error,
    redirectPath,
    pageContent.noClientRedirectHref,
  ]);

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
