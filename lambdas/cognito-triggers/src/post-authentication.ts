import type { PostAuthenticationTriggerEvent } from 'aws-lambda';
import {
  AdminUserGlobalSignOutCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';

export const handler = async (event: PostAuthenticationTriggerEvent) => {
  const client = new CognitoIdentityProviderClient();

  await client.send(
    new AdminUserGlobalSignOutCommand({
      UserPoolId: event.userPoolId,
      Username: event.userName,
    })
  );

  return event;
};
