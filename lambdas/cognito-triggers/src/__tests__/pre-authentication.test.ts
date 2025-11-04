import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import { PreAuthenticationTriggerEvent } from 'aws-lambda';
import { handler } from '@/src/pre-authentication';
import { retrieveInternalUser } from '@/src/utils/users-repository';

jest.mock('@nhs-notify-iam-webauth/utils-logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    child: jest.fn().mockReturnThis(),
  },
}));
jest.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  ...jest.requireActual('@aws-sdk/client-cognito-identity-provider'),
}));
jest.mock('@/src/utils/cognito-customisation-util');
jest.mock('@/src/utils/users-repository');

const userPoolId = 'user-pool-id';
const userName = 'user-name';

const baseEvent: PreAuthenticationTriggerEvent = {
  request: { userAttributes: {} },
  userName,
  userPoolId,
  version: 'version',
  region: 'region',
  triggerSource: 'PreAuthentication_Authentication',
  callerContext: {
    awsSdkVersion: 'aws-sdk',
    clientId: '1h2g3f',
  },
  response: {},
};

describe('pre-authentication: Client membership held in DDB', () => {
  test('should approve user with DDB held client membership', async () => {
    // arrange
    const event: PreAuthenticationTriggerEvent = {
      ...baseEvent,
      request: {
        userAttributes: {
          'custom:nhs_notify_user_id': 'internal-user-id',
        },
      },
    };

    jest.mocked(retrieveInternalUser).mockImplementation(async () => ({
      PK: 'INTERNAL_USER#internal-user-id',
      SK: 'CLIENT#0123456789',
      client_id: '0123456789',
    }));

    // act
    const result = await handler(event);

    // assert
    expect(result).toEqual(event);
  });

  test('should reject missing internal user in database', async () => {
    // arrange
    const event: PreAuthenticationTriggerEvent = {
      ...baseEvent,
      request: {
        userAttributes: {
          'custom:nhs_notify_user_id': 'internal-user-id',
        },
      },
    };

    jest.mocked(retrieveInternalUser).mockImplementation(async () => null);

    // act/assert
    await expect(handler(event)).rejects.toThrow('PRE_AUTH_ERROR');
  });

  test('should reject user with no client configuration', async () => {
    // arrange
    const cognitoMock = jest.spyOn(CognitoIdentityProvider.prototype, 'send');
    cognitoMock.mockImplementation(() =>
      Promise.resolve({
        Groups: [{ GroupName: 'eu-west-2_000000000_NHSIDP-prod' }],
      })
    );

    // act/assert
    await expect(handler(baseEvent)).rejects.toThrow(
      'PRE_AUTH_NO_CLIENT_FAILURE'
    );
  });
});

describe('pre-authentication: Client membership held in Cognito Groups', () => {
  test('should approve user with Cognito group held client membership', async () => {
    // arrange
    const cognitoMock = jest.spyOn(CognitoIdentityProvider.prototype, 'send');
    cognitoMock.mockImplementation(() =>
      Promise.resolve({
        Groups: [
          { GroupName: 'eu-west-2_000000000_NHSIDP-prod' },
          { GroupName: 'client:client-id' },
        ],
      })
    );

    // act/assert
    expect(await handler(baseEvent)).toEqual(baseEvent);
  });

  test('throws error with message PRE_AUTH_ERROR when more than one client is configured', async () => {
    // arrange
    const cognitoMock = jest.spyOn(CognitoIdentityProvider.prototype, 'send');
    cognitoMock.mockImplementation(() =>
      Promise.resolve({
        Groups: [
          { GroupName: 'eu-west-2_000000000_NHSIDP-prod' },
          { GroupName: 'client:client-id' },
          { GroupName: 'client:client-2' },
        ],
      })
    );

    // act/assert
    await expect(handler(baseEvent)).rejects.toThrow('PRE_AUTH_ERROR');
  });

  test('throws error with message PRE_AUTH_NO_CLIENT_FAILURE when cognito unexpectedly returns no Groups field on response', async () => {
    // arrange
    const cognitoMock = jest.spyOn(CognitoIdentityProvider.prototype, 'send');
    cognitoMock.mockImplementation(() => Promise.resolve({}));

    // act/assert
    await expect(handler(baseEvent)).rejects.toThrow(
      'PRE_AUTH_NO_CLIENT_FAILURE'
    );
  });
});
