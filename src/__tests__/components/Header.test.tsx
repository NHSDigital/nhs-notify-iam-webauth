import { render, screen } from '@testing-library/react';
import { NHSNotifyHeader } from '@/src/components/molecules/Header/Header';
import { Authenticator } from '@aws-amplify/ui-react';

describe('Header component', () => {
  it('renders component correctly', async () => {
    const container = render(
      <Authenticator.Provider>
        <NHSNotifyHeader />
      </Authenticator.Provider>
    );
    const ENV = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...ENV };
    });

    afterAll(() => {
      process.env = ENV;
    });
    it('renders component correctly', async () => {
      render(<NHSNotifyHeader />);

      await screen.findByText('Sign in');

      expect(container.asFragment()).toMatchSnapshot();
    });

    it('should not render login link', () => {
      process.env.NEXT_PUBLIC_DISABLE_CONTENT = 'true';
      render(<NHSNotifyHeader />);

      expect(screen.queryByTestId('login-link')).not.toBeInTheDocument();
    });
  });
});
