const { mockClient } = require('aws-sdk-client-mock');
const {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
} = require('@aws-sdk/client-cognito-identity-provider');
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { handler } = require('../index');

const cognitoMock = mockClient(CognitoIdentityProviderClient);
const s3Mock = mockClient(S3Client);

describe('handler', () => {
  beforeEach(() => {
    cognitoMock.reset();
    s3Mock.reset();
  });

  it('should log an error if deleting user backup from S3 fails', async () => {
    const event = {
      eventName: 'AdminDeleteUser',
      detail: {
        requestParameters: { userPoolId: 'testPoolId' },
        additionalEventData: { sub: 'testUser' },
      },
    };
    process.env.S3_BUCKET_NAME = 'testBucket';

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    s3Mock.on(DeleteObjectCommand).rejects(new Error('S3 delete error'));

    await handler(event);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      JSON.stringify({
        level: 'error',
        message: 'Error deleting backup for user testUser',
        userName: 'testUser',
        event: 'AdminDeleteUser',
        error: 'S3 delete error',
      })
    );

    consoleErrorSpy.mockRestore();
  });

  it('should log an error if backing up user to S3 fails', async () => {
    const event = {
      eventName: 'CreateUser',
      detail: {
        requestParameters: { userPoolId: 'testPoolId' },
        additionalEventData: { sub: 'testUser' },
      },
    };
    process.env.S3_BUCKET_NAME = 'testBucket';

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    cognitoMock
      .on(AdminGetUserCommand)
      .rejects(new Error('Cognito get user error'));

    await handler(event);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      JSON.stringify({
        level: 'error',
        message: 'Error backing up user testUser',
        userName: 'testUser',
        event: 'CreateUser',
        error: 'Cognito get user error',
      })
    );

    consoleErrorSpy.mockRestore();
  });
});
