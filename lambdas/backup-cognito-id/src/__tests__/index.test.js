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

  it('should back up user to S3 successfully', async () => {
    const event = {
      eventName: 'CreateUser',
      detail: {
        requestParameters: { userPoolId: 'testPoolId' },
        additionalEventData: { sub: 'testUser' },
      },
    };
    process.env.S3_BUCKET_NAME = 'testBucket';

    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    cognitoMock.on(AdminGetUserCommand).resolves({
      UserAttributes: [
        { Name: 'email', Value: 'test@example.com' },
        { Name: 'name', Value: 'Test User' },
      ],
    });
    s3Mock.on(PutObjectCommand).resolves({});

    await handler(event);

    expect(consoleInfoSpy).toHaveBeenCalledWith(
      JSON.stringify({
        level: 'info',
        message: 'Successfully backed up user testUser to S3',
        userName: 'testUser',
        event: 'CreateUser',
      })
    );

    consoleInfoSpy.mockRestore();
  });

  it('should correctly encapsulate user attributes containing commas', async () => {
    const event = {
      eventName: 'CreateUser',
      detail: {
        requestParameters: { userPoolId: 'testPoolId' },
        additionalEventData: { sub: 'testUser' },
      },
    };
    process.env.S3_BUCKET_NAME = 'testBucket';

    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    cognitoMock.on(AdminGetUserCommand).resolves({
      UserAttributes: [
        { Name: 'email', Value: 'test@example.com' },
        { Name: 'name', Value: 'Test, User' },
        { Name: 'phone_number', Value: '+1234567890' },
        {
          Name: 'custom:abd_customAttrib',
          Value: `'1234567890-=!@£$%^&*()_+;',.'`,
        },
      ],
    });
    s3Mock.on(PutObjectCommand).resolves({});

    await handler(event);

    expect(consoleInfoSpy).toHaveBeenCalledWith(
      JSON.stringify({
        level: 'info',
        message: 'Successfully backed up user testUser to S3',
        userName: 'testUser',
        event: 'CreateUser',
      })
    );

    const putObjectCall = s3Mock.calls(PutObjectCommand).pop();
    const csvContent = putObjectCall.args[0].input.Body;
    expect(csvContent).toBe(
      `email,name,phone_number,custom:abd_customAttrib\n"test@example.com","Test, User","+1234567890","'1234567890-=!@£$%^&*()_+;',.'"`
    );

    consoleInfoSpy.mockRestore();
  });
});
