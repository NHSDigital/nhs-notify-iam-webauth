import { render } from '@testing-library/react';
import { CIS2LoginButton } from '@/src/components/CIS2LoginButton/CIS2LoginButton';

describe('CIS2LoginButton', () => {
  it('renders CIS2LoginButton correctly', async () => {
    const container = render(<CIS2LoginButton onClick={jest.fn()} />);

    expect(container.asFragment()).toMatchSnapshot();
  });
});
