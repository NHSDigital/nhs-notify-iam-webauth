import { render, screen, waitFor } from '@testing-library/react';
import { signOut } from '@aws-amplify/auth';
import SignOutPage from '../../../app/signout/page';

jest.mock('@aws-amplify/auth');

jest.mock('../../../components/molecules/Redirect/Redirect', () => ({
  Redirect: () => <p>redirected</p>,
}));

const signOutMock = jest.mocked(signOut);

describe('Signout Page', () => {
  beforeEach(jest.resetAllMocks);

  test('signs out user and redirects', async () => {
    signOutMock.mockResolvedValueOnce();

    render(<SignOutPage />);

    await waitFor(() =>
      expect(screen.getByText('Signing out')).toBeInTheDocument()
    );

    await waitFor(() =>
      expect(screen.getByText('redirected')).toBeInTheDocument()
    );

    expect(signOut).toHaveBeenCalled();
  });
});
