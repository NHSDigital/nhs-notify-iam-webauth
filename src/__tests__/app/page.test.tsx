import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Hub } from 'aws-amplify/utils';
import { redirect } from 'next/navigation';
import { federatedSignIn } from '@/src/utils/federated-sign-in';
import SignInPage from '@/src/app/page';

jest.mock('aws-amplify/utils', () => ({
  Hub: {
    listen: jest.fn(),
  },
}));

const mockGetSearchParams = jest.fn();

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  RedirectType: { replace: 'replace' },
  useSearchParams: () => ({
    get: mockGetSearchParams,
  }),
}));

jest.mock('@aws-amplify/ui-react', () => ({
  Authenticator: () => <div>Placeholder Sign-in form</div>,
}));

jest.mock('@/src/components/CIS2SignInButton/CIS2SignInButton', () => ({
  CIS2SignInButton: ({ onClick }: { onClick: () => void }) => (
    <button type='button' data-testid='mock-cis2-button' onClick={onClick}>
      Mock CIS2 Sign In Button
    </button>
  ),
}));

jest.mock('@/src/utils/federated-sign-in');

const mockedHub = jest.mocked(Hub);
const mockedRedirect = jest.mocked(redirect);
const mockFederatedSignIn = jest.mocked(federatedSignIn);

function getEventListener() {
  const lastHubListenCall = mockedHub.listen.mock.lastCall;
  const eventType = lastHubListenCall?.[0];
  const eventListener = lastHubListenCall?.[1];

  expect(eventType).toBe('auth');

  expect(eventListener).toBeTruthy();
  return eventListener!;
}

describe('SignInPage', () => {
  const originalCognitoIdpSetting = process.env.NEXT_PUBLIC_ENABLE_COGNITO_IDP;

  it('renders', async () => {
    process.env.NEXT_PUBLIC_ENABLE_COGNITO_IDP = 'false';

    const container = render(<SignInPage />);

    expect(container.asFragment()).toMatchSnapshot();

    process.env.NEXT_PUBLIC_ENABLE_COGNITO_IDP = originalCognitoIdpSetting;
  });

  it('renders with cognito login form if env var switch is enabled', () => {
    process.env.NEXT_PUBLIC_ENABLE_COGNITO_IDP = 'true';

    const container = render(<SignInPage />);

    expect(container.asFragment()).toMatchSnapshot();

    process.env.NEXT_PUBLIC_ENABLE_COGNITO_IDP = originalCognitoIdpSetting;
  });

  it('does federated sign in when clicking cis2 button', async () => {
    const user = userEvent.setup();

    const container = render(<SignInPage />);

    const button = container.getByTestId('mock-cis2-button');

    await user.click(button);

    expect(mockFederatedSignIn).toHaveBeenCalledWith('/home');
  });

  it('sets redirect based on search params when clicking cis2 button', async () => {
    const user = userEvent.setup();

    mockGetSearchParams.mockReturnValueOnce('/example-redirect');

    const container = render(<SignInPage />);

    const button = container.getByTestId('mock-cis2-button');

    await user.click(button);

    expect(mockFederatedSignIn).toHaveBeenCalledWith('/example-redirect');
  });

  it('listens for oauth state events', async () => {
    const page = <SignInPage />;
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
        '?redirect=%2Ftesting',
        'replace'
      )
    );
  });

  it('ignores other state events', async () => {
    const page = <SignInPage />;
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
    const page = <SignInPage />;
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
        '?redirect=%2Fhome',
        'replace'
      )
    );
  });
});
