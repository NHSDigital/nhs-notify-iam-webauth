import {
  AdminUserGlobalSignOutCommand,
  type CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import type { PostAuthenticationTriggerEvent } from 'aws-lambda';
import { mock, mockClear } from 'jest-mock-extended';
import { handler } from '../post-authentication';

const cognitoMock = mock<CognitoIdentityProviderClient>();

jest.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  ...jest.requireActual('@aws-sdk/client-cognito-identity-provider'),
  CognitoIdentityProviderClient: jest
    .fn()
    .mockImplementation(() => cognitoMock),
}));

beforeEach(() => {
  mockClear(cognitoMock);
});

const makeEvent = ({
  userName = '',
  userPoolId = '',
} = {}): PostAuthenticationTriggerEvent => ({
  version: '',
  region: '',
  userPoolId,
  triggerSource: 'PostAuthentication_Authentication',
  userName,
  callerContext: {
    awsSdkVersion: '',
    clientId: '',
  },
  request: {
    userAttributes: {},
    newDeviceUsed: false,
  },
  response: {},
});

describe('post-authentication handler', () => {
  test('signs user out of other sessions', async () => {
    const userName = 'test-username-1';
    const userPoolId = 'test-user-pool-id-1';
    const event = makeEvent({ userName, userPoolId });
    const response = await handler(event);

    // I wanted to use aws-sdk-client-mock
    // But I spent far too long trying to fix a type error caused by node_modules version mismatches
    // Caused by aws-amplify using fixed versions of dependencies
    expect(cognitoMock.send).toHaveBeenCalledTimes(1);
    const lastCall = cognitoMock.send.mock
      .calls[0][0] as AdminUserGlobalSignOutCommand;

    expect(lastCall.input).toEqual({
      Username: userName,
      UserPoolId: userPoolId,
    });

    expect(response).toBe(event);
  });
});
