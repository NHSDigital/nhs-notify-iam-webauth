'use client';

import { withAuthenticator } from '@aws-amplify/ui-react';
import { AuthUser } from 'aws-amplify/auth';
import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function Login({
  user,
  redirectPath,
}: {
  user?: AuthUser;
  redirectPath?: string;
}) {
  useEffect(() => {
    if (user && redirectPath) {
      location.href = redirectPath;
    }
  }, [user, redirectPath]);
  if (redirectPath && user) {
    return (
      <h3>
        Redirecting to{' '}
        <code>
          <a href={redirectPath}>{redirectPath}</a>
        </code>
      </h3>
    );
  }
  return null;
}

const LoginWithAuthenticator = () => {
  const searchParams = useSearchParams();
  return withAuthenticator(Login, {
    variation: 'default',
    hideSignUp: true,
  })({
    redirectPath: searchParams.get('redirect') || 'no-redirect',
  });
};

export default LoginWithAuthenticator;
