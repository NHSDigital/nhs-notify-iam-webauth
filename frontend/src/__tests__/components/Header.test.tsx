import { render } from '@testing-library/react';
import NHSNotifyHeader from '@/components/molecules/Header/Header';

function mockAuthLink() {
  return <div data-testid='auth-link' />;
}

jest.mock('@/components/molecules/AuthLink/AuthLink', () => mockAuthLink);

describe('Header component', () => {
  it('renders component correctly', async () => {
    const container = render(<NHSNotifyHeader />);

    expect(container.asFragment()).toMatchSnapshot();
  });
});
