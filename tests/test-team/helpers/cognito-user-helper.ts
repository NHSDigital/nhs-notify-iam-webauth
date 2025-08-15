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

export type Client = { clientId: string; clientConfig?: { name?: string } };

export class CognitoUserHelper {
  private readonly cognito = new CognitoIdentityProviderClient({
    region: 'eu-west-2',
  });

  private readonly ssm = new SSMClient({
    region: 'eu-west-2',
  });

  private clients = new Set<string>();

  async createUser(
    username: string,
    client: Client | null,
    userAttributes: {
      given_name?: string;
      family_name?: string;
      preferred_username?: string;
    } = {}
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
          ...Object.entries(userAttributes).map(([Name, Value]) => ({
            Name,
            Value,
          })),
        ],
        MessageAction: 'SUPPRESS',
        TemporaryPassword: process.env.TEMPORARY_USER_PASSWORD,
      })
    );

    const userId = user?.User?.Username;

    if (!userId) {
      throw new Error('Unable to generate cognito user');
    }

    if (client) {
      if (!this.clients.has(client.clientId)) {
        this.clients.add(client.clientId);
        await this.createClientGroup(client);

        if (client.clientConfig) {
          await this.configureClient(client);
        }
      }

      await this.addUserToClientGroup(userId, client);
    }

    return {
      email,
      userId,
    };
  }

  async deleteUser(username: string, client: Client | null) {
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

    if (client && this.clients.has(client.clientId)) {
      this.clients.delete(client.clientId);
      await this.deleteClientGroup(client);

      if (client.clientConfig) {
        await this.deleteClientConfig(client);
      }
    }
  }

  private async createClientGroup(client: Client) {
    await this.cognito.send(
      new CreateGroupCommand({
        GroupName: `client:${client.clientId}`,
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      })
    );
  }

  private async deleteClientGroup(client: Client) {
    await this.cognito.send(
      new DeleteGroupCommand({
        GroupName: `client:${client.clientId}`,
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      })
    );
  }

  private async addUserToClientGroup(username: string, client: Client) {
    await this.cognito.send(
      new AdminAddUserToGroupCommand({
        GroupName: `client:${client.clientId}`,
        Username: username,
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      })
    );
  }

  private async removeUserFromClientGroup(username: string, client: Client) {
    await this.cognito.send(
      new AdminRemoveUserFromGroupCommand({
        GroupName: `client:${client.clientId}`,
        Username: username,
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      })
    );
  }

  private async configureClient(client: Client) {
    await this.ssm.send(
      new PutParameterCommand({
        Name: `${process.env.CLIENT_CONFIG_PARAMETER_PATH_PREFIX}/${client.clientId}`,
        Value: JSON.stringify(client.clientConfig),
        Type: 'SecureString',
        KeyId: process.env.KMS_KEY_ID,
        Overwrite: true,
      })
    );
  }

  private async deleteClientConfig(client: Client) {
    await this.ssm.send(
      new DeleteParameterCommand({
        Name: `${process.env.CLIENT_CONFIG_PARAMETER_PATH_PREFIX}/${client.clientId}`,
      })
    );
  }
}
