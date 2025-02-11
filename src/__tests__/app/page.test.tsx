import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UseAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { redirect, RedirectType } from 'next/navigation';
import { mockDeep } from 'jest-mock-extended';
import { federatedSignIn } from '@/src/utils/federated-sign-in';
import SignInPage from '@/src/app/page';

const mockGetSearchParams = jest.fn();

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useSearchParams: () => ({
    get: mockGetSearchParams,
  }),
  redirect: jest.fn(),
}));

jest.mock('@aws-amplify/ui-react', () => ({
  Authenticator: () => <p>Placeholder Sign-in form</p>,
  useAuthenticator: jest.fn(() =>
    mockDeep<UseAuthenticator>({ authStatus: 'unauthenticated' })
  ),
}));

jest.mock('@/src/components/CIS2SignInButton/CIS2SignInButton', () => ({
  CIS2SignInButton: ({ onClick }: { onClick: () => void }) => (
    <button type='button' data-testid='mock-cis2-button' onClick={onClick}>
      Mock CIS2 Sign In Button
    </button>
  ),
}));

jest.mock('@/src/utils/federated-sign-in');

const mockFederatedSignIn = jest.mocked(federatedSignIn);
const mockUseAuthenticator = jest.mocked(useAuthenticator);
const mockRedirect = jest.mocked(redirect);

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

  it('redirects using search parameter if already signed in', () => {
    mockUseAuthenticator.mockReturnValueOnce(
      mockDeep<UseAuthenticator>({ authStatus: 'authenticated' })
    );

    mockGetSearchParams.mockReturnValueOnce('/example-redirect');

    render(<SignInPage />);

    expect(mockRedirect).toHaveBeenCalledWith(
      '/signin/example-redirect',
      RedirectType.push
    );
  });

  it('redirects to /home if already signed in and there is no redirect search parameter', () => {
    mockUseAuthenticator.mockReturnValueOnce(
      mockDeep<UseAuthenticator>({ authStatus: 'authenticated' })
    );

    render(<SignInPage />);

    expect(mockRedirect).toHaveBeenCalledWith('/home', RedirectType.push);
  });

  describe('CIS2 login', () => {
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
  });
});
