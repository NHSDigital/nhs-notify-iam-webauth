import { mockDeep } from 'jest-mock-extended';
import { render } from '@testing-library/react';
import { UseAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { signOut } from '@aws-amplify/auth';
import JsCookie from 'js-cookie';
import { SignOut } from '@/src/components/molecules/SignOut/SignOut';

jest.mock('@aws-amplify/ui-react', () => ({
  useAuthenticator: jest.fn(() =>
    mockDeep<UseAuthenticator>({
      authStatus: 'authenticated',
    })
  ),
}));
jest.mock('@aws-amplify/auth');
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

    expect(signOut).toHaveBeenCalledWith({ global: true });
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

    expect(signOut).not.toHaveBeenCalled();
    expect(cookieMock.remove).not.toHaveBeenCalled();

    expect(page.asFragment()).toMatchSnapshot();
  });
});
