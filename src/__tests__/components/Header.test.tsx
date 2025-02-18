import { render, screen } from '@testing-library/react';
import { NHSNotifyHeader } from '@/src/components/molecules/Header/Header';

jest.mock('@/src/components/molecules/AuthLink/AuthLink', () => ({
  AuthLink: () => <div data-testid='auth-link' />,
}));

describe('Header component', () => {
  const ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ENV };
  });

  afterAll(() => {
    process.env = ENV;
  });

  it('renders component correctly', async () => {
    const container = render(<NHSNotifyHeader />);

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('should not render auth link', () => {
    process.env.NEXT_PUBLIC_DISABLE_CONTENT = 'true';

    render(<NHSNotifyHeader />);

    expect(screen.queryByTestId('auth-link')).not.toBeInTheDocument();
  });

  it('should render auth link', () => {
    process.env.NEXT_PUBLIC_DISABLE_CONTENT = 'false';

    render(<NHSNotifyHeader />);

    expect(screen.queryByTestId('auth-link')).toBeInTheDocument();
  });
});
