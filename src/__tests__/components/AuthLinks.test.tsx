import { mockDeep } from 'jest-mock-extended';
import { UseAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { render, screen } from '@testing-library/react';
import { AuthSession } from '@aws-amplify/auth';
import { AuthLinks } from '@/src/components/molecules/AuthLinks/AuthLinks';

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

test('AuthLinks - authenticated', async () => {
  useAuthenticatorMock.mockReturnValue(
    mockDeep<UseAuthenticator>({
      authStatus: 'authenticated',
    })
  );

  const container = render(<AuthLinks />);

  await screen.findByText('Sign out');

  expect(container.asFragment()).toMatchSnapshot();
});

test('AuthLinks - unauthenticated', async () => {
  useAuthenticatorMock.mockReturnValue(
    mockDeep<UseAuthenticator>({
      authStatus: 'unauthenticated',
    })
  );

  const container = render(<AuthLinks />);

  await screen.findByText('Sign in');

  expect(container.asFragment()).toMatchSnapshot();
});

test('AuthLinks - configuring', async () => {
  jest.mocked(useAuthenticator).mockReturnValue(
    mockDeep<UseAuthenticator>({
      authStatus: 'configuring',
    })
  );

  const container = render(<AuthLinks />);

  await screen.findByText('Sign in');

  expect(container.asFragment()).toMatchSnapshot();
});
