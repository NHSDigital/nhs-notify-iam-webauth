'use client';

import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { BASE_PATH } from '@/src/utils/constants';

export const LoginStatus = () => {
  const { authStatus } = useAuthenticator();

  if (authStatus === 'authenticated') {
    return (
      <a
        id='login-link'
        className='nhsuk-account__login--link'
        href={`${BASE_PATH}/signout`}
      >
        Log out
      </a>
    );
  }

  return (
    <a id='logout-link' className='nhsuk-account__login--link' href={BASE_PATH}>
      Log in
    </a>
  );
};
