/* eslint-disable import-x/prefer-default-export */
import {
  AdminListGroupsForUserCommand,
  CognitoIdentityProvider,
} from '@aws-sdk/client-cognito-identity-provider';
import type { PreAuthenticationTriggerEvent } from 'aws-lambda';
import { logger } from '@nhs-notify-iam-webauth/utils-logger';

const cognito = new CognitoIdentityProvider({ region: 'eu-west-2' });

export const handler = async (event: PreAuthenticationTriggerEvent) => {
  const response = await cognito
    .send(
      new AdminListGroupsForUserCommand({
        UserPoolId: event.userPoolId,
        Username: event.userName,
      })
    )
    .catch((error) => {
      logger.error('Unexpected error during pre-authentication', error);

      throw new Error('PRE_AUTH_ERROR');
    });

  const clientGroups = response.Groups?.filter((g) =>
    g.GroupName?.startsWith('client:')
  );

  const count = clientGroups?.length ?? 0;

  if (count > 1) {
    logger.error('User belongs to more than one client');

    throw new Error('PRE_AUTH_ERROR');
  }

  if (count === 0) {
    throw new Error('PRE_AUTH_NO_CLIENT_FAILURE');
  }

  return event;
};
