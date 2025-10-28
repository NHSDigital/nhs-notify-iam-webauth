import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import { PreAuthenticationTriggerEvent } from 'aws-lambda';
import { handler } from '@/src/pre-authentication';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

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
jest.mock('@aws-sdk/lib-dynamodb', () => ({
  ...jest.requireActual('@aws-sdk/lib-dynamodb'),
}));

const userPoolId = 'user-pool-id';
const userName = 'user-name';

const event: PreAuthenticationTriggerEvent = {
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
  beforeEach(() => {
    const cognitoMock = jest.spyOn(CognitoIdentityProvider.prototype, 'send');
    cognitoMock.mockImplementation(() =>
      Promise.resolve({
        Groups: [{ GroupName: 'eu-west-2_000000000_NHSIDP-prod' }],
      })
    );
  });

  test('returns original event when user has a single client', async () => {
    jest
      .spyOn(DynamoDBDocumentClient.prototype, 'send')
      .mockImplementation(() =>
        Promise.resolve({
          Items: [
            {
              username: userName,
              client_id: 'client-id',
            },
          ],
        })
      );

    expect(await handler(event)).toEqual(event);
  });

  test('throws error with message PRE_AUTH_ERROR when more than one client is configured', async () => {
    jest
      .spyOn(DynamoDBDocumentClient.prototype, 'send')
      .mockImplementation(() =>
        Promise.resolve({
          Items: [
            {
              username: userName,
              client_id: 'client-id',
            },
            {
              username: userName,
              client_id: 'client-2',
            },
          ],
        })
      );

    await expect(handler(event)).rejects.toThrow('PRE_AUTH_ERROR');
  });

  test('throws error with message PRE_AUTH_NO_CLIENT_FAILURE when zero clients are configured', async () => {
    jest
      .spyOn(DynamoDBDocumentClient.prototype, 'send')
      .mockImplementation(() => Promise.resolve({}));

    await expect(handler(event)).rejects.toThrow('PRE_AUTH_NO_CLIENT_FAILURE');
  });
});

describe('pre-authentication: Client membership held in Cognito Groups', () => {
  beforeEach(() => {
    jest
      .spyOn(DynamoDBDocumentClient.prototype, 'send')
      .mockImplementation(() => Promise.resolve({ Items: [] }));
  });

  test('returns original event when user has a single client', async () => {
    const cognitoMock = jest.spyOn(CognitoIdentityProvider.prototype, 'send');
    cognitoMock.mockImplementation(() =>
      Promise.resolve({
        Groups: [
          { GroupName: 'eu-west-2_000000000_NHSIDP-prod' },
          { GroupName: 'client:client-id' },
        ],
      })
    );

    expect(await handler(event)).toEqual(event);
  });

  test('throws error with message PRE_AUTH_ERROR when cognito call fails', async () => {
    const cognitoMock = jest.spyOn(CognitoIdentityProvider.prototype, 'send');
    cognitoMock.mockImplementation(() => Promise.reject(new Error('err')));

    await expect(handler(event)).rejects.toThrow('PRE_AUTH_ERROR');
  });

  test('throws error with message PRE_AUTH_ERROR when more than one client is configured', async () => {
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

    await expect(handler(event)).rejects.toThrow('PRE_AUTH_ERROR');
  });

  test('throws error with message PRE_AUTH_NO_CLIENT_FAILURE when zero clients are configured', async () => {
    const cognitoMock = jest.spyOn(CognitoIdentityProvider.prototype, 'send');
    cognitoMock.mockImplementation(() =>
      Promise.resolve({
        Groups: [{ GroupName: 'eu-west-2_000000000_NHSIDP-prod' }],
      })
    );

    await expect(handler(event)).rejects.toThrow('PRE_AUTH_NO_CLIENT_FAILURE');
  });

  test('throws error with message PRE_AUTH_NO_CLIENT_FAILURE when cognito unexpectedly returns no Groups field on response', async () => {
    const cognitoMock = jest.spyOn(CognitoIdentityProvider.prototype, 'send');
    cognitoMock.mockImplementation(() => Promise.resolve({}));

    await expect(handler(event)).rejects.toThrow('PRE_AUTH_NO_CLIENT_FAILURE');
  });
});
