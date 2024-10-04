import { render, screen } from '@testing-library/react';
import SigninPage from '@/src/app/page';

test('SigninPage', async () => {
  const container = render(<SigninPage />);

  await screen.findAllByText('Sign in');

  expect(container.asFragment()).toMatchSnapshot();
});
