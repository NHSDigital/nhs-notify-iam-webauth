/* eslint-disable unicorn/consistent-function-scoping */
import { signInWithRedirect } from '@aws-amplify/auth';
import { federatedSignIn } from '@/src/utils/federated-sign-in';

jest.mock('@/amplify_outputs.json', () => ({
  version: '1.3',
}));

jest.mock('@aws-amplify/auth', () => ({
  signInWithRedirect: jest.fn(),
}));

const signInWithRedirectMock = jest.mocked(signInWithRedirect);
// eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module, import/no-unresolved
const mockedAmplifyOutputs = jest.mocked(require('@/amplify_outputs.json'));

describe('federated-sign-in', () => {
  beforeEach(() => {
    mockedAmplifyOutputs.auth = { oauth: { identity_providers: [] } };
  });

  it('should return a correctly configured signinWithRedirect function', () => {
    // arrange
    mockedAmplifyOutputs.auth.oauth.identity_providers = ['CIS2-test'];

    // act
    federatedSignIn('/my-redirect-path');

    // assert
    expect(signInWithRedirectMock).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: {
          custom: 'CIS2-test',
        },
        customState: '{"redirectPath":"/my-redirect-path"}',
      })
    );
  });

  it('should report an error if too many federated providers', () => {
    // arrange
    mockedAmplifyOutputs.auth.oauth.identity_providers = [
      'CIS2-test',
      'CIS3-test',
    ];

    // act
    const action = () => federatedSignIn('/my-redirect-path');

    // assert
    expect(action).toThrow('Invalid OAUTH provider configuration');
  });

  it('should report an error if too few federated providers', () => {
    // arrange
    mockedAmplifyOutputs.auth.oauth.identity_providers = [];

    // act
    const action = () => federatedSignIn('/my-redirect-path');

    // assert
    expect(action).toThrow('Invalid OAUTH provider configuration');
  });

  it('should report an empty provider configuration', () => {
    // arrange
    mockedAmplifyOutputs.auth.oauth.identity_providers = [''];

    // act
    const action = () => federatedSignIn('/my-redirect-path');

    // assert
    expect(action).toThrow('Missing OAUTH custom provider configuration');
  });

  it('should report missing auth config', () => {
    // arrange
    mockedAmplifyOutputs.auth = undefined;

    // act
    const action = () => federatedSignIn('/my-redirect-path');

    // assert
    expect(action).toThrow('Invalid OAUTH provider configuration');
  });

  it('should report missing oauth config', () => {
    // arrange
    mockedAmplifyOutputs.auth.oauth = undefined;

    // act
    const action = () => federatedSignIn('/my-redirect-path');

    // assert
    expect(action).toThrow('Invalid OAUTH provider configuration');
  });
});
