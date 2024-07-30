import { render, screen } from '@testing-library/react';
import HomePage from '@/src/app/page';

describe('HomePage component', () => {
  it('renders component correctly', () => {
    render(<HomePage />);

    expect(screen.getByTestId('page-heading')).toBeInTheDocument();
  });
});
