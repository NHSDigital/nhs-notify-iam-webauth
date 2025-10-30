/* eslint-disable import-x/prefer-default-export */
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';

export const INTERNAL_ID_ATTRIBUTE = 'custom:nhs_notify_user_id';

const cognito = new CognitoIdentityProvider({ region: 'eu-west-2' });

export async function populateInternalUserId(
  userName: string,
  internalUserId: string,
  userPoolId: string
): Promise<void> {
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
