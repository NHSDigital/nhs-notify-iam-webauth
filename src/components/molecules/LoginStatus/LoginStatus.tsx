'use client';

import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { getBasePath } from '@/utils/get-base-path';

export const LoginStatus = () => {
  const { authStatus } = useAuthenticator();

  if (authStatus === 'authenticated') {
    return (
      <a
        className='nhsuk-account__login--link'
        href={`${getBasePath()}/signout`}
      >
        Log out
      </a>
    );
  }

  return (
    <a className='nhsuk-account__login--link' href={`${getBasePath()}`}>
      Log in
    </a>
  );
};
