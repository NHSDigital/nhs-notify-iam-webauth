'use client';

import {
  Heading,
  useTheme,
  withAuthenticator,
  AuthenticatorProps,
} from '@aws-amplify/ui-react';
import { AuthUser } from 'aws-amplify/auth';
import React, { useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { signInWithRedirect } from '@aws-amplify/auth';
import { Button } from 'nhsuk-react-components';
import { useSearchParams } from 'next/navigation';

function auth0Login(redirectPath: string) {
  console.log(Amplify.getConfig());
  signInWithRedirect({
    provider: {
      custom: 'Auth0',
    },
    customState: JSON.stringify({ redirectPath }),
  }).catch(console.error);
}

function components(redirectPath: string): AuthenticatorProps['components'] {
  return {
    SignIn: {
      Header() {
        const { tokens } = useTheme();

        return (
          <>
            <Heading
              padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
              level={3}
            >
              Sign in to your account
            </Heading>
            <div
              className='login-oidc'
              style={{
                position: 'relative',
                padding: `${tokens.space.xl} ${tokens.space.xl} 0 ${tokens.space.xl}`,
              }}
            >
              <Button
                className='login-oidc__button'
                style={{ width: '100%' }}
                onClick={() => auth0Login(redirectPath)}
              >
                Log in with Auth0
              </Button>
            </div>
            <div style={{ textAlign: 'center' }}>or</div>
          </>
        );
      },
    },
  };
}

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

const LoginWithAuthenticator = (props: {
  redirectPath?: string;
  user?: AuthUser;
}) => {
  const { redirectPath } = props;
  const searchParams = useSearchParams();
  console.log('searchParams', searchParams.get('redirect'), searchParams.entries().next());
  return withAuthenticator(Login, {
    variation: 'default',
    hideSignUp: true,
    components: components(redirectPath || searchParams.get('redirect') || '/'),
  })(props);
};

export default LoginWithAuthenticator;
