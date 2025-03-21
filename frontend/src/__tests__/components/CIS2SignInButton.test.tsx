import { render } from '@testing-library/react';
import { CIS2SignInButton } from '@/src/components/CIS2SignInButton/CIS2SignInButton';

describe('CIS2SignInButton', () => {
  it('renders CIS2SignInButton correctly', async () => {
    const container = render(<CIS2SignInButton onClick={jest.fn()} />);

    expect(container.asFragment()).toMatchSnapshot();
  });
});
