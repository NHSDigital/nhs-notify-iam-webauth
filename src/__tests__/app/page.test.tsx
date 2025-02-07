import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { federatedSignIn } from '@/src/utils/federated-sign-in';
import SignInPage from '@/src/app/page';
import { ReactNode } from 'react';

const mockGetSearchParams = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: mockGetSearchParams,
  }),
}));

jest.mock('@aws-amplify/ui-react', () => ({
  Authenticator: ({ children }: { children: ReactNode }) => (
    <div>
      <h2>Placeholder Sign-in form</h2>
      {children}
    </div>
  ),
}));

jest.mock('@/src/components/CIS2SignInButton/CIS2SignInButton', () => ({
  CIS2SignInButton: ({ onClick }: { onClick: () => void }) => (
    <button type='button' data-testid='mock-cis2-button' onClick={onClick}>
      Mock CIS2 Sign In Button
    </button>
  ),
}));

jest.mock('@/src/components/molecules/Redirect/Redirect', () => ({
  Redirect: () => <p>Mock Redirect Component</p>,
}));

jest.mock('@/src/utils/federated-sign-in');

const mockFederatedSignIn = jest.mocked(federatedSignIn);

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
