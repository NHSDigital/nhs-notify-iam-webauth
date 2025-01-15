'use client';

import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { getConstants } from '@/src/utils/public-constants';

const { BASE_PATH } = getConstants();

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
