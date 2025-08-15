import { render } from '@testing-library/react';
import RequestToBeAddedToAServicePage from '@/app/request-to-be-added-to-a-service/page';

describe('RequestToBeAddedToAServicePage', () => {
  it('renders as expected', async () => {
    const container = render(<RequestToBeAddedToAServicePage />);

    expect(container.asFragment()).toMatchSnapshot();
  });
});
