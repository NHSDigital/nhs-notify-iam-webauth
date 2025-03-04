import { mockDeep } from 'jest-mock-extended';
import { render } from '@testing-library/react';
import { useAuthenticator, UseAuthenticator } from '@aws-amplify/ui-react';
import JsCookie from 'js-cookie';
import { SignOut } from '@/src/components/molecules/SignOut/SignOut';

const signOutMock = jest.fn();
jest.mock('@aws-amplify/ui-react', () => ({
  useAuthenticator: jest.fn(() =>
    mockDeep<UseAuthenticator>({
      authStatus: 'authenticated',
      signOut: signOutMock,
    })
  ),
}));
jest.mock('js-cookie');

const useAuthenticatorMock = jest.mocked(useAuthenticator);
const cookieMock = jest.mocked(JsCookie);

describe('Signout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('calls signOut when user is authenticated', async () => {
    const page = render(
      <SignOut>
        <p>signed out</p>
      </SignOut>
    );

    expect(signOutMock).toHaveBeenCalled();
    expect(cookieMock.remove).toHaveBeenCalledWith('csrf_token');

    expect(page.asFragment()).toMatchSnapshot();
  });

  test('does not call signOut when user is unauthenticated', async () => {
    useAuthenticatorMock.mockReturnValueOnce(
      mockDeep<UseAuthenticator>({ authStatus: 'unauthenticated' })
    );
    const page = render(
      <SignOut>
        <p>signed out</p>
      </SignOut>
    );

    expect(signOutMock).not.toHaveBeenCalled();
    expect(cookieMock.remove).not.toHaveBeenCalled();

    expect(page.asFragment()).toMatchSnapshot();
  });
});
