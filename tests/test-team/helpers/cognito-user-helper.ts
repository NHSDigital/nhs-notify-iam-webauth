import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminDisableUserCommand,
  AdminRemoveUserFromGroupCommand,
  CognitoIdentityProviderClient,
  CreateGroupCommand,
  DeleteGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  DeleteParameterCommand,
  PutParameterCommand,
  SSMClient,
} from '@aws-sdk/client-ssm';

export type User = {
  email: string;
  userId: string;
};

export class CognitoUserHelper {
  private readonly cognito = new CognitoIdentityProviderClient({
    region: 'eu-west-2',
  });

  private readonly ssm = new SSMClient({
    region: 'eu-west-2',
  });

  async createUser(
    username: string,
    userAttributes?: {
      given_name?: string;
      family_name?: string;
      preferred_username?: string;
    }
  ): Promise<User> {
    // Note: we use a unique prefix to that we don't interfere with other users.
    const email = `${process.env.USER_EMAIL_PREFIX}-${username}@nhs.net`;

    const user = await this.cognito.send(
      new AdminCreateUserCommand({
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
        Username: email,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: 'true' },
          ...(userAttributes
            ? Object.entries(userAttributes).map(([Name, Value]) => ({
                Name,
                Value,
            }))
            : []),
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
    await this.cognito.send(
      new AdminDisableUserCommand({
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
        Username: username,
      })
    );

    await this.cognito.send(
      new AdminDeleteUserCommand({
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
        Username: username,
      })
    );
  }

  async createClientGroup(clientId: string) {
    await this.cognito.send(
      new CreateGroupCommand({
        GroupName: `client:${clientId}`,
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      })
    );
  }

  async deleteClientGroup(clientId: string) {
    await this.cognito.send(
      new DeleteGroupCommand({
        GroupName: `client:${clientId}`,
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      })
    );
  }

  async addUserToClientGroup(username: string, clientId: string) {
    await this.cognito.send(
      new AdminAddUserToGroupCommand({
        GroupName: `client:${clientId}`,
        Username: username,
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      })
    );
  }

  async removeUserFromClientGroup(username: string, clientId: string) {
    await this.cognito.send(
      new AdminRemoveUserFromGroupCommand({
        GroupName: `client:${clientId}`,
        Username: username,
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      })
    );
  }

  async configureClient(
    clientId: string,
    clientConfig: { name?: string; campaignId?: string }
  ) {
    await this.ssm.send(
      new PutParameterCommand({
        Name: `${process.env.CLIENT_CONFIG_PARAMETER_PATH_PREFIX}/${clientId}`,
        Value: JSON.stringify(clientConfig),
        Type: 'SecureString',
        KeyId: process.env.KMS_KEY_ID,
        Overwrite: true,
      })
    );
  }

  async deleteClientConfig(clientId: string) {
    await this.ssm.send(
      new DeleteParameterCommand({
        Name: `${process.env.CLIENT_CONFIG_PARAMETER_PATH_PREFIX}/${clientId}`,
      })
    );
  }
}
