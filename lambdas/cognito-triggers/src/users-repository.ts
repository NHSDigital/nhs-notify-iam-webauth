import { logger } from '@nhs-notify-iam-webauth/utils-logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';

const ddbDocClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: 'eu-west-2' }),
  {
    marshallOptions: { removeUndefinedValues: true },
  }
);

const USERS_TABLE = process.env.USERS_TABLE ?? '';

type ExternalUserMapping = { PK: string; SK: string };
export type UserClient = { PK: string; client_id: string };

export async function findInternalUserIdentifier(
  externalUserIdentifier: string
): Promise<string> {
  const input: QueryCommandInput = {
    TableName: USERS_TABLE,
    KeyConditionExpression: 'PK = :partitionKey',
    ExpressionAttributeValues: {
      ':partitionKey': `EXTERNAL_USER#${externalUserIdentifier}`,
    },
  };

  const result = await ddbDocClient.send(new QueryCommand(input));
  const items = result.Items ?? ([] as ExternalUserMapping[]);
  if (items.length > 1) {
    throw new Error(
      `Multiple internal user identifiers found for external user ${externalUserIdentifier}`
    );
  }
  const internalUserId = items[0]?.SK.replace('INTERNAL_USER#', '');

  const userLogger = logger.child({ username: externalUserIdentifier });
  userLogger.info(`Internal user ID: ${internalUserId}`);

  return internalUserId ?? '';
}

export async function retrieveInternalUser(
  internalUserId: string
): Promise<UserClient> {
  const input: QueryCommandInput = {
    TableName: USERS_TABLE,
    KeyConditionExpression: 'PK = :partitionKey',
    ExpressionAttributeValues: {
      ':partitionKey': `INTERNAL_USER#${internalUserId}`,
    },
  };

  const userClientsResult = await ddbDocClient.send(new QueryCommand(input));
  const items = userClientsResult.Items ?? ([] as UserClient[]);
  if (items.length !== 1) {
    throw new Error(
      `Expected exactly one user client for internal user ID ${internalUserId}, found ${items.length}`
    );
  }
  return items[0] as UserClient;
}
