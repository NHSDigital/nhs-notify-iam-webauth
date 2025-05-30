import { mockDeep } from 'jest-mock-extended';
import { UseAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { render, screen } from '@testing-library/react';
import { AuthSession } from '@aws-amplify/auth';
import AuthLink from '@/components/molecules/AuthLink/AuthLink';

jest.mock('@aws-amplify/ui-react');
jest.mock('aws-amplify/auth', () => ({
  fetchAuthSession: async () =>
    mockDeep<AuthSession>({
      tokens: {
        idToken: {
          payload: {
            email: 'test-email',
          },
        },
      },
    }),
}));

const useAuthenticatorMock = jest.mocked(useAuthenticator);

test('AuthLink - authenticated', async () => {
  useAuthenticatorMock.mockReturnValue(
    mockDeep<UseAuthenticator>({
      authStatus: 'authenticated',
    })
  );

  const container = render(<AuthLink />);

  await screen.findByText('Sign out');

  expect(container.asFragment()).toMatchSnapshot();
});

test('AuthLink - unauthenticated', async () => {
  useAuthenticatorMock.mockReturnValue(
    mockDeep<UseAuthenticator>({
      authStatus: 'unauthenticated',
    })
  );

  const container = render(<AuthLink />);

  await screen.findByText('Sign in');

  expect(container.asFragment()).toMatchSnapshot();
});

test('AuthLink - configuring', async () => {
  jest.mocked(useAuthenticator).mockReturnValue(
    mockDeep<UseAuthenticator>({
      authStatus: 'configuring',
    })
  );

  const container = render(<AuthLink />);

  await screen.findByText('Sign in');

  expect(container.asFragment()).toMatchSnapshot();
});
