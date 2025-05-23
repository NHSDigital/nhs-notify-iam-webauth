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

  it('should correctly encapsulate user attributes containing nested JSON', async () => {
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
        { Name: 'SimpleAttribute', Value: 'simple value' },
        {
          Name: 'ComplexAttribute1',
          Value: JSON.stringify({
            attr1: 'value1',
            attr2: 123,
            attr3: { attr31: 'value31 ' },
          }),
        },
        {
          Name: 'ComplexAttribute2',
          Value: JSON.stringify(['test1', 'test2']),
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
      `SimpleAttribute,ComplexAttribute1,ComplexAttribute2\n"simple value","{""attr1"":""value1"",""attr2"":123,""attr3"":{""attr31"":""value31 ""}}","[""test1"",""test2""]"`
    );

    consoleInfoSpy.mockRestore();
  });
});

it('should delete user backup from S3 successfully', async () => {
  const event = {
    eventName: 'AdminDeleteUser',
    detail: {
      requestParameters: { userPoolId: 'testPoolId' },
      additionalEventData: { sub: 'testUser' },
    },
  };
  process.env.S3_BUCKET_NAME = 'testBucket';

  const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
  s3Mock.on(DeleteObjectCommand).resolves({});

  await handler(event);

  expect(consoleInfoSpy).toHaveBeenCalledWith(
    JSON.stringify({
      level: 'info',
      message: 'Deleting backup for user testUser from S3',
      userName: 'testUser',
      event: 'AdminDeleteUser',
    })
  );

  expect(consoleInfoSpy).toHaveBeenCalledWith(
    JSON.stringify({
      level: 'info',
      message: 'Successfully deleted backup for user testUser from S3',
      userName: 'testUser',
      event: 'AdminDeleteUser',
    })
  );

  consoleInfoSpy.mockRestore();
});
