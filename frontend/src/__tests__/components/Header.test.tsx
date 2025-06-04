import { render } from '@testing-library/react';
import NHSNotifyHeader from '@/components/molecules/Header/Header';

jest.mock('@/components/molecules/AuthLink/AuthLink', () => ({
  __esModule: true,
  default: () => <div data-testid='auth-link' />,
}));

describe('Header component', () => {
  it('renders component correctly', async () => {
    const container = render(<NHSNotifyHeader />);

    expect(container.asFragment()).toMatchSnapshot();
  });
});
