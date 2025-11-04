import {
  DynamoDBClient,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { logger } from './logger';

const ddbDocClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: 'eu-west-2' }),
  {
    marshallOptions: { removeUndefinedValues: true },
  }
);

type ExternalUserMapping = { PK: string; SK: string };

const USERS_TABLE_NAME = (env: string) => `nhs-notify-${env}-app-users`;

export async function findInternalUserIdentifier(
  externalUserIdentifier: string,
  env: string
): Promise<string | null> {
  const input: QueryCommandInput = {
    TableName: USERS_TABLE_NAME(env),
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
  return items[0]?.SK.replace('INTERNAL_USER#', '') ?? null;
}

export async function createUser(
  externalUserIdentifier: string,
  clientId: string,
  env: string,
  dryRun: boolean
): Promise<string> {
  const internalUserId = crypto.randomUUID();

  const createInternalUser = {
    TableName: USERS_TABLE_NAME(env),
    Item: {
      PK: { S: `INTERNAL_USER#${internalUserId}` },
      SK: { S: `CLIENT#${clientId}` },
      client_id: { S: clientId },
    },
  };

  const createExternalUserMapping = {
    TableName: USERS_TABLE_NAME(env),
    Item: {
      PK: { S: `EXTERNAL_USER#${externalUserIdentifier}` },
      SK: { S: `INTERNAL_USER#${internalUserId}` },
    },
  };

  const transaction = new TransactWriteItemsCommand({
    TransactItems: [
      {
        Put: createInternalUser,
      },
      {
        Put: createExternalUserMapping,
      },
    ],
  });

  if (dryRun) {
    logger.info(`Would have run transaction: ${JSON.stringify(transaction)}`);
    return internalUserId;
  }

  await ddbDocClient.send(transaction);
  return internalUserId;
}
