import { render } from '@testing-library/react';
import { NHSNotifyHeader } from '@/src/components/molecules/Header/Header';

jest.mock('@/src/components/molecules/AuthLink/AuthLink', () => ({
  AuthLink: () => <div data-testid='auth-link' />,
}));

describe('Header component', () => {
  it('renders component correctly', async () => {
    const container = render(<NHSNotifyHeader />);

    expect(container.asFragment()).toMatchSnapshot();
  });
});
