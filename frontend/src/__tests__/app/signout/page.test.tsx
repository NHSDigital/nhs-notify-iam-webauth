import { render, screen, waitFor } from '@testing-library/react';
import SignOutPage from '@/app/signout/page';

jest.mock('@/components/molecules/SignOut/SignOut', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Signout Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('signs out user and redirects', async () => {
    render(<SignOutPage />);

    await waitFor(() =>
      expect(screen.getByText('Signed out')).toBeInTheDocument()
    );
  });
});
