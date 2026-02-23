import {
  CognitoIdentityProvider,
  ListUserPoolsCommandOutput,
  ListUsersCommandOutput,
  UserPoolDescriptionType,
  UserType,
} from '@aws-sdk/client-cognito-identity-provider';
import { logger } from '@/src/utils/logger';

export const INTERNAL_ID_ATTRIBUTE = 'custom:nhs_notify_user_id';

const TARGET_USER_POOL_NAME = (env: string) => `nhs-notify-${env}-app`;

const cognito = new CognitoIdentityProvider({ region: 'eu-west-2' });

export async function discoverUserPoolId(env: string): Promise<string> {
  let paginationToken: string | undefined;
  let userPools: UserPoolDescriptionType[] = [];
  do {
    const response: ListUserPoolsCommandOutput = await cognito.listUserPools({
      MaxResults: 60,
      NextToken: paginationToken,
    });

    userPools = [...userPools, ...(response.UserPools ?? [])];
    paginationToken = response.NextToken;
  } while (paginationToken);

  const userPoolId = userPools.find(
    (pool) => pool.Name === TARGET_USER_POOL_NAME(env)
  )?.Id;
  if (!userPoolId) {
    throw new Error(`User pool ${TARGET_USER_POOL_NAME(env)} not found`);
  }

  logger.info(`Discovered user pool ID: ${userPoolId}`);
  return userPoolId;
}

export async function retrieveUsers(userPoolId: string): Promise<UserType[]> {
  let paginationToken: string | undefined;
  let users: UserType[] = [];
  do {
    const response: ListUsersCommandOutput = await cognito.listUsers({
      UserPoolId: userPoolId,
      PaginationToken: paginationToken,
      Limit: 60,
    });

    users = [...users, ...(response.Users ?? [])];
    paginationToken = response.PaginationToken;
  } while (paginationToken);

  logger.info(`Retrieved ${users.length} users from Cognito`);

  return users;
}
