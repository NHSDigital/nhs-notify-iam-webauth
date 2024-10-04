'use client';

import React, { Suspense } from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { Redirect } from '../components/molecules/Redirect/Redirect';

export default function Page() {
  return (
    <Suspense>
      {withAuthenticator(Redirect, {
        variation: 'default',
        hideSignUp: true,
      })({})}
    </Suspense>
  );
}
