import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import { logger } from '@/src/utils/logger';

export const INTERNAL_ID_ATTRIBUTE = 'custom:nhs_notify_user_id';

const cognito = new CognitoIdentityProvider({ region: 'eu-west-2' });

export async function populateInternalUserId(
  userName: string,
  internalUserId: string,
  userPoolId: string,
  dryRun: boolean
): Promise<void> {
  if (dryRun) {
    logger.info(
      `Would have populated internal user ID ${internalUserId} for user ${userName} in Cognito`
    );
    return;
  }

  await cognito.adminUpdateUserAttributes({
    UserPoolId: userPoolId,
    Username: userName,
    UserAttributes: [
      {
        Name: INTERNAL_ID_ATTRIBUTE,
        Value: internalUserId,
      },
    ],
  });
}
