import { render, screen, waitFor } from '@testing-library/react';
import SignOutPage from '../../../app/signout/page';

jest.mock('../../../components/molecules/Redirect/Redirect', () => ({
  Redirect: () => <p>redirected</p>,
}));

jest.mock('../../../components/molecules/SignOut/SignOut', () => ({
  SignOut: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Signout Page', () => {
  beforeEach(jest.resetAllMocks);

  test('signs out user and redirects', async () => {
    render(<SignOutPage />);

    await waitFor(() =>
      expect(screen.getByText('redirected')).toBeInTheDocument()
    );
  });
});
