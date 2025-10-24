'use client';

import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import content from '@/content/content';
import { authenticatorSelector } from '@/utils/authenticator-selector';
import concatClassNames from '@/utils/concat-class-names';

const headerContent = content.components.header;

export default function AuthLink({
  className,
}: Readonly<{ className?: string }>) {
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
      className={concatClassNames('nhsuk-header__account-link', className)}
      href={linkContent.href}
    >
      {linkContent.text}
    </a>
  );
}
