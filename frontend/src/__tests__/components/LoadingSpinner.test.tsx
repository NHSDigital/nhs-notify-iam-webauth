import { render } from '@testing-library/react';
import { LoadingSpinner } from '@/src/components/LoadingSpinner/LoadingSpinner';

describe('LoadingSpinner component', () => {
  it('renders component correctly', async () => {
    const container = render(<LoadingSpinner text='loading text' />);

    expect(container.asFragment()).toMatchSnapshot();
  });
});
