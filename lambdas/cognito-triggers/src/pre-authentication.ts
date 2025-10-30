/* eslint-disable import-x/prefer-default-export */
/* eslint-disable security/detect-object-injection */
import {
  AdminListGroupsForUserCommand,
  CognitoIdentityProvider,
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

export const handler = async (event: PreAuthenticationTriggerEvent) => {
  const { userName } = event;
  let userLogger = logger.child({ username: userName });

  let internalUserId = event.request.userAttributes[INTERNAL_ID_ATTRIBUTE];
  if (!internalUserId) {
    userLogger.info(
      'No internal user ID found in Cognito attributes, looking up from DynamoDB'
    );
    internalUserId = await findInternalUserIdentifier(userName);
    await populateInternalUserId(userName, internalUserId, event.userPoolId);
    userLogger.info(
      `Populated internal user ID in Cognito attributes ${internalUserId}`
    );
  }

  userLogger = logger.child({ username: userName, internalUserId });
  userLogger.info('Processing event');
  let clientCount = 0;
  if (!internalUserId) {
    const internalUser = await retrieveInternalUser(internalUserId);
    if (!internalUser) {
      userLogger.error('Internal user not found in DynamoDB');
      throw new Error('PRE_AUTH_ERROR');
    }
    clientCount = internalUser.client_id ? 1 : 0;
  }

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
