import { mockDeep } from 'jest-mock-extended';
import { UseAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { render, screen } from '@testing-library/react';
import { AuthSession } from '@aws-amplify/auth';
import { LoginStatus } from '../../components/molecules/LoginStatus/LoginStatus';

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

test('LoginStatus - authenticated', async () => {
  useAuthenticatorMock.mockReturnValue(
    mockDeep<UseAuthenticator>({
      authStatus: 'authenticated',
    })
  );

  const container = render(<LoginStatus />);

  await screen.findByText('Log out');

  expect(container.asFragment()).toMatchSnapshot();
});

test('LoginStatus - unauthenticated', async () => {
  useAuthenticatorMock.mockReturnValue(
    mockDeep<UseAuthenticator>({
      authStatus: 'unauthenticated',
    })
  );

  const container = render(<LoginStatus />);

  await screen.findByText('Log in');

  expect(container.asFragment()).toMatchSnapshot();
});

test('LoginStatus - configuring', async () => {
  jest.mocked(useAuthenticator).mockReturnValue(
    mockDeep<UseAuthenticator>({
      authStatus: 'configuring',
    })
  );

  const container = render(<LoginStatus />);

  await screen.findByText('Log in');

  expect(container.asFragment()).toMatchSnapshot();
});
