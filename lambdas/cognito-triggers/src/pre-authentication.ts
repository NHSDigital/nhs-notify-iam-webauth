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

export const handler = async (event: PreAuthenticationTriggerEvent) => {
  const { userName } = event;
  const userLogger = logger.child({ username: userName });

  userLogger.info('Processing event');

  const input: QueryCommandInput = {
    TableName: USERS_TABLE,
    KeyConditionExpression: '#username = :username',
    ExpressionAttributeNames: {
      '#username': 'username',
    },
    ExpressionAttributeValues: {
      ':username': userName,
    },
  };

  type UserClient = { username: string; client_id: string };
  const userClientsResult = await ddbDocClient.send(new QueryCommand(input));
  const items = userClientsResult.Items ?? ([] as Array<UserClient>);

  userLogger.info(`Found DB results ${JSON.stringify(items)}`);
  let clientCount = items.length;
  if (clientCount == 0) {
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
