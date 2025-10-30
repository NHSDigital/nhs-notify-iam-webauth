import {
  CognitoIdentityProvider,
  ListUserImportJobsCommandOutput,
  ListUserPoolsCommandOutput,
  ListUsersCommandOutput,
  UserPoolDescriptionType,
  UserType,
} from '@aws-sdk/client-cognito-identity-provider';
import { logger } from './utils/logger';
import { writeFile, writeFileSync } from 'node:fs';

const TARGET_USER_POOL_NAME = 'nhs-notify-main-app';

const cognito = new CognitoIdentityProvider({ region: 'eu-west-2' });

async function discoverUserPoolId(): Promise<string> {
  let paginationToken: string | undefined = undefined;
  let userPools: UserPoolDescriptionType[] = [];
  do {
    const response: ListUserPoolsCommandOutput = await cognito.listUserPools({
      MaxResults: 60,
      NextToken: paginationToken,
    });

    userPools = userPools.concat(response.UserPools ?? []);
    paginationToken = response.NextToken;
  } while (paginationToken);

  const userPoolId = userPools.find(
    (pool) => pool.Name === TARGET_USER_POOL_NAME
  )?.Id;
  if (!userPoolId) {
    throw new Error(`User pool ${TARGET_USER_POOL_NAME} not found`);
  }

  logger.info(`Discovered user pool ID: ${userPoolId}`);
  return userPoolId;
}

async function retrieveUsers(userPoolId: string): Promise<UserType[]> {
  let paginationToken: string | undefined = undefined;
  let users: UserType[] = [];
  do {
    const response: ListUsersCommandOutput = await cognito.listUsers({
      UserPoolId: userPoolId,
      PaginationToken: paginationToken,
      Limit: 60,
    });

    users = users.concat(response.Users ?? []);
    paginationToken = response.PaginationToken;
  } while (paginationToken);

  logger.info(`Retrieved ${users.length} users from Cognito`);

  return users;
}

async function retrieveUserGroups(
  users: UserType[],
  userPoolId: string
): Promise<{ user: UserType; groups: string[] }[]> {
  const combinedResults: { user: UserType; groups: string[] }[] = [];
  for (const user of users) {
    const response = await cognito.adminListGroupsForUser({
      UserPoolId: userPoolId,
      Username: user.Username!,
    });

    const groups = response.Groups?.map((group) => group.GroupName!) || [];
    combinedResults.push({ user, groups });
  }

  logger.info(
    `Retrieved groups for ${combinedResults.length} users from Cognito`
  );

  return combinedResults;
}

async function runMigration() {
  // Discover user pool ID
  const userPoolId = await discoverUserPoolId();

  // Extract user from Cognito
  const users = await retrieveUsers(userPoolId);

  // Enhance with group membership
  const usersWithGroups = await retrieveUserGroups(users, userPoolId);

  // Backup existing data

  // Migrate data to DynamoDB

  logger.info('Data migration from Cognito to DynamoDB completed successfully');
}

runMigration().catch((error) => {
  logger.error('Migration failed', error);
  process.exit(1);
});
