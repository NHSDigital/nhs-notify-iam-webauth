/* eslint-disable import-x/prefer-default-export */
/* eslint-disable security/detect-object-injection */
import {
  AdminListGroupsForUserCommand,
  CognitoIdentityProvider,
  GroupType,
} from '@aws-sdk/client-cognito-identity-provider';
import type { PreAuthenticationTriggerEvent } from 'aws-lambda';
import { logger } from '@nhs-notify-iam-webauth/utils-logger';
import {
  findInternalUserIdentifier,
  retrieveInternalUser,
} from '@/src/utils/users-repository';
import {
  INTERNAL_ID_ATTRIBUTE,
  populateInternalUserId,
} from '@/src/utils/cognito-customisation-util';

const cognito = new CognitoIdentityProvider({ region: 'eu-west-2' });

async function getClientCognitoGroups(
  userPoolId: string,
  userName: string
): Promise<GroupType[]> {
  const response = await cognito.send(
    new AdminListGroupsForUserCommand({
      UserPoolId: userPoolId,
      Username: userName,
    })
  );

  return (
    response.Groups?.filter((g) => g.GroupName?.startsWith('client:')) ?? []
  );
}

export const handler = async (event: PreAuthenticationTriggerEvent) => {
  const { userName } = event;
  let userLogger = logger.child({ username: userName });

  // If the user does not have an internal user ID attribute, look it up from DDB and populate it in Cognito
  let internalUserId = event.request.userAttributes[INTERNAL_ID_ATTRIBUTE];
  if (!internalUserId) {
    userLogger.info(
      'No internal user ID found in Cognito attributes, looking up from DynamoDB'
    );
    internalUserId = (await findInternalUserIdentifier(userName)) ?? '';
    await populateInternalUserId(userName, internalUserId, event.userPoolId);
    userLogger.info(
      `Populated internal user ID in Cognito attributes ${internalUserId}`
    );
  }

  userLogger = logger.child({ username: userName, internalUserId });
  userLogger.info('Processing event');
  let clientCount = 0;
  // First, try to get client membership from DynamoDB
  if (internalUserId) {
    const internalUser = await retrieveInternalUser(internalUserId);
    if (!internalUser) {
      userLogger.error('Internal user not found in DynamoDB');
      throw new Error('PRE_AUTH_ERROR');
    }
    clientCount = 1;
  }

  // If no client membership found in DDB, fall back to Cognito groups (deprecated)
  if (clientCount === 0) {
    const clientGroups = await getClientCognitoGroups(
      event.userPoolId,
      userName
    );
    clientCount = clientGroups.length;
  }

  // Fail login if there is a data issue with client membership (bad data)
  if (clientCount > 1) {
    userLogger.error('User belongs to more than one client');
    throw new Error('PRE_AUTH_ERROR');
  }

  // Fail login if user does not belong to any client (user not yet configured)
  if (clientCount === 0) {
    userLogger.info('User does not belong to a client');
    throw new Error('PRE_AUTH_NO_CLIENT_FAILURE');
  }

  return event;
};
