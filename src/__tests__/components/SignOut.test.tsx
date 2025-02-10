import { mockDeep } from 'jest-mock-extended';
import { useAuthenticator, UseAuthenticator } from '@aws-amplify/ui-react';
import { SignOut } from '@/src/components/molecules/SignOut/SignOut';
import { render } from '@testing-library/react';

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

describe('Signout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('calls signOut when user is authenticated', async () => {
    const page = render(<SignOut>test</SignOut>);

    expect(signOutMock).toHaveBeenCalled();

    expect(page.asFragment()).toMatchSnapshot();
  });

  test('does not call signOut when user is unauthenticated', async () => {
    useAuthenticatorMock.mockReturnValueOnce(
      mockDeep<UseAuthenticator>({ authStatus: 'unauthenticated' })
    );
    const page = render(<SignOut>test</SignOut>);

    expect(signOutMock).not.toHaveBeenCalled();

    expect(page.asFragment()).toMatchSnapshot();
  });
});
