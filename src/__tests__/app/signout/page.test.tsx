import { ReactNode, ComponentType } from 'react';
import { render, screen } from '@testing-library/react';
import SignoutPage from '../../../app/signout/page';

jest.mock('@aws-amplify/auth', () => ({
  signOut: () => Promise.resolve(),
}));

jest.mock('../../../components/molecules/Redirect/Redirect', () => ({
  Redirect: () => <p>redirect</p>,
}));

jest.mock('@aws-amplify/ui-react', () => ({
  Authenticator: {
    Provider: ({ children }: { children: ReactNode }) => children,
  },
  withAuthenticator: (Component: ComponentType) => Component,
}));

test('MockSignoutPage', async () => {
  const container = render(<SignoutPage />);

  await screen.findByText('redirect');

  expect(container.asFragment()).toMatchSnapshot();
});
