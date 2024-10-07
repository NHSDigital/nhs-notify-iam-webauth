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

    await screen.findByText('Sign in');

    expect(container.asFragment()).toMatchSnapshot();
  });
});
