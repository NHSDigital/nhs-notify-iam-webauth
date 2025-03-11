import type { PostAuthenticationTriggerEvent } from 'aws-lambda';
import { handler } from '../post-authentication';

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
    expect(response).toBe(event);
  });
});
