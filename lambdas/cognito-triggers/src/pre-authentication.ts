/* eslint-disable import-x/prefer-default-export */
/* eslint-disable security/detect-object-injection */
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

    if (!internalUserId) {
      userLogger.info('User does not belong to a client');
      throw new Error('PRE_AUTH_NO_CLIENT_FAILURE');
    }
    await populateInternalUserId(userName, internalUserId, event.userPoolId);
    userLogger.info(
      `Populated internal user ID in Cognito attributes ${internalUserId}`
    );
  }

  userLogger = logger.child({ username: userName, internalUserId });
  userLogger.info('Processing event');

  const internalUser = await retrieveInternalUser(internalUserId);
  if (!internalUser) {
    userLogger.error('Internal user not found in DynamoDB');
    throw new Error('PRE_AUTH_ERROR');
  }

  return event;
};
