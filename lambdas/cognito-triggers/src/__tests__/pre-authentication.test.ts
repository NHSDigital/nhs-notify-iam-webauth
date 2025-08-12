import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import {
  AdminListGroupsForUserCommand,
  CognitoIdentityProvider,
} from '@aws-sdk/client-cognito-identity-provider';
import { PreAuthenticationTriggerEvent } from 'aws-lambda';
import { handler } from '@/src/pre-authentication';

jest.mock('@nhs-notify-iam-webauth/utils-logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

const cognitoMock = mockClient(CognitoIdentityProvider);

beforeEach(() => {
  cognitoMock.reset();
});

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

describe('pre authetication handler', () => {
  test('returns original event when user has a single client', async () => {
    cognitoMock
      .on(AdminListGroupsForUserCommand)
      .resolvesOnce({ Groups: [{ GroupName: 'client:client-id' }] });

    expect(await handler(event)).toEqual(event);
  });

  test('throws error with message PRE_AUTH_ERROR when cognito call fails', async () => {
    cognitoMock.on(AdminListGroupsForUserCommand).rejectsOnce(new Error('err'));

    await expect(handler(event)).rejects.toThrow('PRE_AUTH_ERROR');
  });

  test('throws error with message PRE_AUTH_ERROR when more than one client is configured', async () => {
    cognitoMock.on(AdminListGroupsForUserCommand).resolvesOnce({
      Groups: [
        { GroupName: 'client:client-1' },
        { GroupName: 'client:client-2' },
      ],
    });

    await expect(handler(event)).rejects.toThrow('PRE_AUTH_ERROR');
  });

  test('throws error with message PRE_AUTH_NO_CLIENT_FAILURE when zero clients are configured', async () => {
    cognitoMock.on(AdminListGroupsForUserCommand).resolvesOnce({
      Groups: [{ GroupName: 'not-a-client-group' }],
    });

    await expect(handler(event)).rejects.toThrow('PRE_AUTH_NO_CLIENT_FAILURE');
  });

  test('throws error with message PRE_AUTH_NO_CLIENT_FAILURE when cognito unexpectedly returns no Groups field on response', async () => {
    cognitoMock.on(AdminListGroupsForUserCommand).resolvesOnce({});

    await expect(handler(event)).rejects.toThrow('PRE_AUTH_NO_CLIENT_FAILURE');
  });
});
