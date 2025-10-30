/* eslint-disable import-x/prefer-default-export */
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import type { PostConfirmationTriggerEvent, PreSignUpTriggerEvent } from 'aws-lambda';
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

async function findInternalUserIdentifier(
  externalUserIdentifier: string
): Promise<string> {
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

export const handler = async (event: PostConfirmationTriggerEvent) => {
  const { userName } = event;
  let userLogger = logger.child({ username: userName });
  userLogger.info('Looking up internal user ID from DynamoDB');

  const internalUserId = await findInternalUserIdentifier(userName);
  userLogger.info(`Found internal user ID: ${internalUserId}`);

  if (internalUserId) {
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

  return event;
};
