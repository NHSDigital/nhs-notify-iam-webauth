import { act, render, waitFor } from '@testing-library/react';
import SignInPage from '@/src/app/page';
import { Hub } from 'aws-amplify/utils';
import { redirect } from 'next/navigation';

jest.mock('aws-amplify/utils', () => ({
  Hub: {
    listen: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  RedirectType: { replace: 'replace' },
  useSearchParams: () => ({
    get: () => '',
  }),
}));

jest.mock('@aws-amplify/ui-react', () => ({
  withAuthenticator: () => () => <div>Placeholder Sign-in form</div>,
}));

const mockedHub = jest.mocked(Hub);
const mockedRedirect = jest.mocked(redirect);

function getEventListener() {
  const lastHubListenCall = mockedHub.listen.mock.lastCall;
  const eventType = lastHubListenCall?.[0];
  const eventListener = lastHubListenCall?.[1];

  expect(eventType).toBe('auth');

  expect(eventListener).toBeTruthy();
  return eventListener!;
}

describe('SignInPage', () => {
  it('renders', async () => {
    const container = render(<SignInPage />);

    // Note: we do this because the Amplify UI for login takes a moment to load.
    await waitFor(() =>
      expect(
        container.getByText('Placeholder Sign-in form')
      ).toBeInTheDocument()
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('listens for oauth state events', async () => {
    const page = <SignInPage />;
    const container = render(page);

    await waitFor(() =>
      expect(
        container.getByText('Placeholder Sign-in form')
      ).toBeInTheDocument()
    );

    const eventListener = getEventListener();

    act(() => {
      eventListener({
        payload: {
          event: 'customOAuthState',
          data: '{"redirectPath":"/testing"}',
        },
        channel: '',
      });
      container.rerender(page);
    });

    await waitFor(() =>
      expect(mockedRedirect).toHaveBeenCalledWith(
        '?redirect=%2Ftesting',
        'replace'
      )
    );
  });

  it('ignores other state events', async () => {
    const page = <SignInPage />;
    const container = render(page);

    await waitFor(() =>
      expect(
        container.getByText('Placeholder Sign-in form')
      ).toBeInTheDocument()
    );

    const eventListener = getEventListener();

    act(() => {
      eventListener({
        payload: {
          event: 'ignoreThis',
          data: '{"redirectPath":"/testing"}',
        },
        channel: '',
      });
      container.rerender(page);
    });

    await waitFor(() => expect(mockedRedirect).not.toHaveBeenCalled());
  });

  it('defaults redirect path', async () => {
    const page = <SignInPage />;
    const container = render(page);

    await waitFor(() =>
      expect(
        container.getByText('Placeholder Sign-in form')
      ).toBeInTheDocument()
    );

    const eventListener = getEventListener();

    act(() => {
      eventListener({
        payload: {
          event: 'customOAuthState',
          data: '{"redirectPath":""}',
        },
        channel: '',
      });
      container.rerender(page);
    });

    await waitFor(() =>
      expect(mockedRedirect).toHaveBeenCalledWith(
        '?redirect=%2Fhome',
        'replace'
      )
    );
  });
});
