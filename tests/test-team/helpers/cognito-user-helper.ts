import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminDisableUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';

export type User = {
  email: string;
  userId: string;
};

export class CognitoUserHelper {
  private readonly client: CognitoIdentityProviderClient;

  constructor() {
    this.client = new CognitoIdentityProviderClient({
      region: 'eu-west-2',
    });
  }

  async createUser(username: string): Promise<User> {
    // Note: we use a unique prefix to that we don't interfere with other users.
    const email = `${process.env.USER_EMAIL_PREFIX}-${username}@nhs.net`;

    const user = await this.client.send(
      new AdminCreateUserCommand({
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
        Username: email,
        UserAttributes: [
          {
            Name: 'email',
            Value: email,
          },
          {
            Name: 'email_verified',
            Value: 'true',
          },
        ],
        MessageAction: 'SUPPRESS',
        TemporaryPassword: process.env.TEMPORARY_USER_PASSWORD,
      })
    );

    if (!user?.User?.Username) {
      throw new Error('Unable to generate cognito user');
    }

    return {
      email,
      userId: user.User.Username,
    };
  }

  async deleteUser(username: string) {
    // Note: we must disable the user first before we can delete them
    await this.client.send(
      new AdminDisableUserCommand({
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
        Username: username,
      })
    );

    await this.client.send(
      new AdminDeleteUserCommand({
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
        Username: username,
      })
    );
  }
}
