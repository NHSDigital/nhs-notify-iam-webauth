'use client';

import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import content from '@/content/content';
import styles from '@/components/molecules/AuthLink/AuthLink.module.scss';
import { authenticatorSelector } from '@/utils/authenticator-selector';

const headerContent = content.components.header;

export default function AuthLink() {
  const { authStatus } = useAuthenticator(authenticatorSelector);

  let id = 'sign-in-link';
  let linkContent = headerContent.accountInfo.links.signIn;
  if (authStatus === 'authenticated') {
    id = 'sign-out-link';
    linkContent = headerContent.accountInfo.links.signOut;
  }

  return (
    <a
      id={id}
      data-testid='auth-link'
      className='nhsuk-header__account-link'
      href={linkContent.href}
    >
      {linkContent.text}
    </a>
  );
}
