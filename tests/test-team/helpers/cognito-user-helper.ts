import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminDisableUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  DeleteParameterCommand,
  PutParameterCommand,
  SSMClient,
} from '@aws-sdk/client-ssm';
import { DeleteItemCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'node:crypto';

const ddbDocClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: 'eu-west-2' }),
  {
    marshallOptions: { removeUndefinedValues: true },
  }
);

export type User = {
  email: string;
  userId: string;
};

export type Client = {
  clientId: string;
  clientConfig?: { name?: string };
};

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

        if (client.clientConfig) {
          await this.configureClient(client);
        }
      }

      // Delete any existing user records just in case the tests are being re-run
      await CognitoUserHelper.deleteUserRecords(userId);

      const internalUserId = randomUUID();
      await ddbDocClient.send(
        new PutCommand({
          TableName: process.env.USERS_TABLE,
          Item: {
            PK: `INTERNAL_USER#${internalUserId}`,
            SK: `CLIENT#${client.clientId}`,
            client_id: client.clientId,
          },
        })
      );
      await ddbDocClient.send(
        new PutCommand({
          TableName: process.env.USERS_TABLE,
          Item: {
            PK: `EXTERNAL_USER#${userId}`,
            SK: `INTERNAL_USER#${internalUserId}`,
          },
        })
      );
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

    if (client && client.clientConfig) {
      await this.deleteClientConfig(client);
    }
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

  private static async findInternalUserIdentifiers(
    externalUserIdentifier: string
  ): Promise<string[]> {
    const input: QueryCommandInput = {
      TableName: process.env.USERS_TABLE,
      KeyConditionExpression: 'PK = :partitionKey',
      ExpressionAttributeValues: {
        ':partitionKey': `EXTERNAL_USER#${externalUserIdentifier}`,
      },
    };

    const result = await ddbDocClient.send(new QueryCommand(input));
    const items = result.Items ?? ([] as { PK: string; SK: string }[]);
    return items.map((item) => item.SK.replace('INTERNAL_USER#', ''));
  }

  private static async findInternalUserClientId(
    internalUserId: string
  ): Promise<string | undefined> {
    const input: QueryCommandInput = {
      TableName: process.env.USERS_TABLE,
      KeyConditionExpression: 'PK = :partitionKey',
      ExpressionAttributeValues: {
        ':partitionKey': `INTERNAL_USER#${internalUserId}`,
      },
    };

    const result = await ddbDocClient.send(new QueryCommand(input));
    const items = result.Items ?? ([] as { client_id: string }[]);
    return items[0]?.client_id;
  }

  private static async deleteUserRecords(
    externalUserId: string
  ): Promise<void> {
    // Query to find the internal user ID associated with the external user ID
    const internalUserIds =
      await this.findInternalUserIdentifiers(externalUserId);

    for (const internalUserId of internalUserIds) {
      // Delete the mapping from EXTERNAL_USER to INTERNAL_USER
      await ddbDocClient.send(
        new DeleteItemCommand({
          TableName: process.env.USERS_TABLE,
          Key: {
            PK: { S: `EXTERNAL_USER#${externalUserId}` },
            SK: { S: internalUserId },
          },
        })
      );

      // Retrieve the client ID associated with the internal user
      const clientId = await this.findInternalUserClientId(internalUserId);
      if (clientId) {
        // Delete the mapping from INTERNAL_USER to CLIENT
        await ddbDocClient.send(
          new DeleteItemCommand({
            TableName: process.env.USERS_TABLE,
            Key: {
              PK: { S: internalUserId },
              SK: { S: `CLIENT#${clientId}` },
            },
          })
        );
      }
    }
  }
}
