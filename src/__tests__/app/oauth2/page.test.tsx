import { act, render, waitFor } from '@testing-library/react';
import { redirect } from 'next/navigation';
import { Hub } from 'aws-amplify/utils';
import OAuth2CallbackPage from '@/src/app/oauth2/page';

jest.mock('aws-amplify/utils', () => ({
  Hub: {
    listen: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  RedirectType: { replace: 'replace' },
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

it('listens for oauth state events from amplify hub', async () => {
  const page = <OAuth2CallbackPage />;
  const container = render(page);

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
      '/signin?redirect=%2Ftesting',
      'replace'
    )
  );
});

it('ignores other hub events', async () => {
  const page = <OAuth2CallbackPage />;
  const container = render(page);

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
  const page = <OAuth2CallbackPage />;
  const container = render(page);

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
      '/signin?redirect=%2Fmanage-templates',
      'replace'
    )
  );
});
