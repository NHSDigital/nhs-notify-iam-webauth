import type { PostConfirmationTriggerEvent } from 'aws-lambda';
import { logger } from '@nhs-notify-iam-webauth/utils-logger';
import { findInternalUserIdentifier } from '@/src/utils/users-repository';
import { populateInternalUserId } from '@/src/utils/cognito-customisation-util';

export default async function handler(event: PostConfirmationTriggerEvent) {
  const { userName } = event;
  const userLogger = logger.child({ username: userName });
  userLogger.info('Looking up internal user ID from DynamoDB');

  const internalUserId = await findInternalUserIdentifier(userName);
  userLogger.info(`Found internal user ID: ${internalUserId}`);

  if (internalUserId) {
    await populateInternalUserId(userName, internalUserId, event.userPoolId);
    userLogger.info(
      `Populated internal user ID in Cognito attributes ${internalUserId}`
    );
  }
  return event;
}
