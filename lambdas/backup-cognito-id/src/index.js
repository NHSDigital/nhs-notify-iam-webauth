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
    return attribute ? `"${attribute.Value}"` : '""';
  });

  return `${headers.join(',')}\n${attributes.join(',')}`;
};

exports.handler = async (event) => {
  const { userPoolId } = event.detail.requestParameters;
  const userName = event.detail.additionalEventData.sub;
  const bucketName = process.env.S3_BUCKET_NAME;

  const deleteEvents = ['DeleteUser', 'AdminDeleteUser'];

  if (deleteEvents.includes(event.eventName)) {
    console.info(`Deleting backup for user ${userName} from S3`);
    try {
      const s3Params = {
        Bucket: bucketName,
        Key: `${userName}.csv`,
      };

      await s3Client.send(new DeleteObjectCommand(s3Params));
      console.info(`Successfully deleted backup for user ${userName} from S3`);
    } catch (error) {
      console.error(`Error deleting backup for user ${userName}:`, error);
    }
  } else {
    console.info(`Backing up user ${userName} to S3`);

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
      console.info(`Successfully backed up user ${userName} to S3`);
    } catch (error) {
      console.error(`Error backing up user ${userName}:`, error);
    }
  }
};
