/* eslint-disable no-console, @typescript-eslint/no-require-imports */

const {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
} = require('@aws-sdk/client-cognito-identity-provider');

const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');

const cognitoClient = new CognitoIdentityProviderClient({});
const s3Client = new S3Client({});

const convertUserToCSV = (user) => {
  const headers = user.UserAttributes.map((attr) => attr.Name);
  const attributes = headers.map((header) => {
    const attribute = user.UserAttributes.find((attr) => attr.Name === header);
    return attribute ? `"${attribute.Value.replaceAll('"', '""')}"` : '""';
  });

  return `${headers.join(',')}\n${attributes.join(',')}`;
};

exports.handler = async (event) => {
  if (process.env.AUDIT_EVENTS) {
    console.log(event);
  }

  const userPoolId = process.env.COGNITO_POOL_ID;
  const bucketName = process.env.S3_BUCKET_NAME;
  const userName = event.detail.additionalEventData.sub;

  const deleteEvents = ['DeleteUser', 'AdminDeleteUser'];

  if (deleteEvents.includes(event.eventName)) {
    console.info(
      JSON.stringify({
        level: 'info',
        message: `Deleting backup for user ${userName} from S3`,
        userName,
        event: event.eventName,
      })
    );
    try {
      const s3Params = {
        Bucket: bucketName,
        Key: `${userName}.csv`,
      };

      await s3Client.send(new DeleteObjectCommand(s3Params));
      console.info(
        JSON.stringify({
          level: 'info',
          message: `Successfully deleted backup for user ${userName} from S3`,
          userName,
          event: event.eventName,
        })
      );
    } catch (error) {
      console.error(
        JSON.stringify({
          level: 'error',
          message: `Error deleting backup for user ${userName}`,
          userName,
          event: event.eventName,
          error: error.message,
        })
      );
    }
  } else {
    console.info(
      JSON.stringify({
        level: 'info',
        message: `Backing up user ${userName} to S3`,
        userName,
        event: event.eventName,
      })
    );

    try {
      const user = await cognitoClient.send(
        new AdminGetUserCommand({
          UserPoolId: userPoolId,
          Username: userName,
        })
      );

      const userData = convertUserToCSV(user);
      const s3Params = {
        Bucket: bucketName,
        Key: `${userName}.csv`,
        Body: userData,
        ContentType: 'text/csv',
      };

      await s3Client.send(new PutObjectCommand(s3Params));
      console.info(
        JSON.stringify({
          level: 'info',
          message: `Successfully backed up user ${userName} to S3`,
          userName,
          event: event.eventName,
        })
      );
    } catch (error) {
      console.error(
        JSON.stringify({
          level: 'error',
          message: `Error backing up user ${userName}`,
          userName,
          event: event.eventName,
          error: error.message,
        })
      );
    }
  }
};
