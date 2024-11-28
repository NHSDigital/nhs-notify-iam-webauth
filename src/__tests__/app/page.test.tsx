import { render, waitFor } from '@testing-library/react';
import SignInPage from '@/src/app/page';

test('SigninPage', async () => {
  const container = render(<SignInPage />);

  // Note: we do this because the Amplify UI for login takes a moment to load.
  await waitFor(() =>
    expect(
      container.getByRole('button', { name: 'Sign in' })
    ).toBeInTheDocument()
  );

  expect(container.asFragment()).toMatchSnapshot();
});
