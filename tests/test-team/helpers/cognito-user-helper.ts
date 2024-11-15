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
  private readonly _client: CognitoIdentityProviderClient;

  constructor() {
    this._client = new CognitoIdentityProviderClient({
      region: 'eu-west-2',
    });
  }

  async createUser(username: string): Promise<User> {
    const email = `${process.env.USER_EMAIL_PREFIX}-${username}@nhs.net`;

    const user = await this._client.send(
      new AdminCreateUserCommand({
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
        Username: email,
        UserAttributes: [
          {
            Name: 'email',
            // Note: we use a unique prefix to that we don't interfere with other users.
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
    await this._client.send(
      new AdminDisableUserCommand({
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
        Username: username,
      })
    );

    await this._client.send(
      new AdminDeleteUserCommand({
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
        Username: username,
      })
    );
  }
}
