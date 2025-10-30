/* eslint-disable import-x/prefer-default-export */
import {
  AdminListGroupsForUserCommand,
  CognitoIdentityProvider,
} from '@aws-sdk/client-cognito-identity-provider';
import type { PreAuthenticationTriggerEvent } from 'aws-lambda';
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

const cognito = new CognitoIdentityProvider({ region: 'eu-west-2' });

async function findInternalUserIdentifier(externalUserIdentifier: string): Promise<string> {
  const input: QueryCommandInput = {
    TableName: USERS_TABLE,
    KeyConditionExpression: 'PK = :partitionKey',
    ExpressionAttributeValues: {
      ':partitionKey': `EXTERNAL_USER#${externalUserIdentifier}`,
    },
  };

  type ExternalUserMapping = { PK: string; SK: string };
  const result = await ddbDocClient.send(new QueryCommand(input));
  const items = result.Items ?? ([] as ExternalUserMapping[]);
  if (items.length > 1) {
    throw new Error(
      `Multiple internal user identifiers found for external user ${externalUserIdentifier}`
    );
  }
  const internalUserId = items[0]?.SK.replace('INTERNAL_USER#', '');

  const userLogger = logger.child({ username: externalUserIdentifier });
  userLogger.info(`Found internal user ID: ${internalUserId}`);

  return internalUserId ?? '';
}

export const handler = async (event: PreAuthenticationTriggerEvent) => {
  const { userName } = event;
  let userLogger = logger.child({ username: userName });

  let internalUserId = event.request.userAttributes.nhs_notify_user_id;
  if (!internalUserId) {
    userLogger.info('No internal user ID found in Cognito attributes, looking up from DynamoDB');
    internalUserId = await findInternalUserIdentifier(userName);
    await cognito.adminUpdateUserAttributes({
      UserPoolId: event.userPoolId,
      Username: userName,
      UserAttributes: [
        {
          Name: 'custom:nhs_notify_user_id',
          Value: internalUserId,
        },
      ],
    });
  }

  userLogger = logger.child({ username: userName, internalUserId });
  userLogger.info('Processing event');

  const input: QueryCommandInput = {
    TableName: USERS_TABLE,
    KeyConditionExpression: 'PK = :partitionKey',
    ExpressionAttributeValues: {
      ':partitionKey': `INTERNAL_USER#${internalUserId}`,
    },
  };

  type UserClient = { PK: string; SK: string, client_id: string };
  const userClientsResult = await ddbDocClient.send(new QueryCommand(input));
  const items = userClientsResult.Items ?? ([] as UserClient[]);

  let clientCount = items.length;
  userLogger.info(`Found DB results ${clientCount}`);
  if (clientCount === 0) {
    const response = await cognito
      .send(
        new AdminListGroupsForUserCommand({
          UserPoolId: event.userPoolId,
          Username: event.userName,
        })
      )
      .catch((error) => {
        userLogger.error('Unexpected error during pre-authentication', error);

        throw new Error('PRE_AUTH_ERROR');
      });

    const clientGroups = response.Groups?.filter((g) =>
      g.GroupName?.startsWith('client:')
    );
    clientCount = clientGroups?.length ?? 0;
  }

  if (clientCount > 1) {
    userLogger.error('User belongs to more than one client');

    throw new Error('PRE_AUTH_ERROR');
  }

  if (clientCount === 0) {
    userLogger.info('User does not belong to a client');

    throw new Error('PRE_AUTH_NO_CLIENT_FAILURE');
  }

  return event;
};
