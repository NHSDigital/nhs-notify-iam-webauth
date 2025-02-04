'use client';

import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { getConstants } from '@/src/utils/public-constants';
import content from '@/src/content/content';

const { BASE_PATH } = getConstants();

export const AuthLinks = () => {
  const { authStatus } = useAuthenticator();

  if (authStatus === 'authenticated') {
    return (
      <a
        id='sign-out-link'
        className='nhsuk-account__sign-in--link'
        href={`${BASE_PATH}/signout`}
      >
        {content.components.headerComponent.links.signOut}
      </a>
    );
  }

  return (
    <a
      id='sign-in-link'
      className='nhsuk-account__sign-in--link'
      href={BASE_PATH}
    >
      {content.components.headerComponent.links.signIn}
    </a>
  );
};
