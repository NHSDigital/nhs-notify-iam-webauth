import { render } from '@testing-library/react';
import { mockDeep } from 'jest-mock-extended';
import { useAuthenticator, UseAuthenticator } from '@aws-amplify/ui-react';
import SignOutPage from '../../../app/signout/page';

const signOutMock = jest.fn();

jest.mock('@aws-amplify/ui-react', () => ({
  useAuthenticator: jest.fn(() =>
    mockDeep<UseAuthenticator>({
      authStatus: 'authenticated',
      signOut: signOutMock,
    })
  ),
}));

const useAuthenticatorMock = jest.mocked(useAuthenticator);

describe('Signout Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('calls signOut when user is authenticated', async () => {
    const page = render(<SignOutPage />);

    expect(signOutMock).toHaveBeenCalled();

    expect(page.asFragment()).toMatchSnapshot();
  });

  test('does not call signOut when user is unauthenticated', async () => {
    useAuthenticatorMock.mockReturnValueOnce(
      mockDeep<UseAuthenticator>({ authStatus: 'unauthenticated' })
    );
    const page = render(<SignOutPage />);

    expect(signOutMock).not.toHaveBeenCalled();

    expect(page.asFragment()).toMatchSnapshot();
  });
});
