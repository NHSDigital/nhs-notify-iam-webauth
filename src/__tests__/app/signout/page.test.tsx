import { render } from '@testing-library/react';
import { mockDeep } from 'jest-mock-extended';
import { UseAuthenticator } from '@aws-amplify/ui-react';
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

describe('Signout Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('calls signOut when user is authenticated', async () => {
    render(<SignOutPage />);

    expect(signOutMock).toHaveBeenCalled();
  });
});
