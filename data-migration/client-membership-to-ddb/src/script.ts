import {
  CognitoIdentityProvider,
  ListUserImportJobsCommandOutput,
  ListUserPoolsCommandOutput,
  ListUsersCommandOutput,
  UserPoolDescriptionType,
  UserType,
} from '@aws-sdk/client-cognito-identity-provider';
import { logger } from '@/src/utils/logger';
import { writeFile, writeFileSync } from 'node:fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {
  discoverUserPoolId,
  retrieveUserGroups,
  retrieveUsers,
} from '@/src/utils/aws/cognito-util';
import { backupDataToS3 } from '@/src/utils/backup-util';
import {
  createUser,
  findInternalUserIdentifier,
} from '@/src/utils/users-repository';
import {
  INTERNAL_ID_ATTRIBUTE,
  populateInternalUserId,
} from './utils/aws/cognito-customisation-util';

const params = yargs(hideBin(process.argv))
  .options({
    env: {
      type: 'string',
      demandOption: true,
    },
    dryRun: {
      type: 'boolean',
      default: true,
    },
  })
  .parseSync();

async function validateUserMigrationPrerequisites(
  user: UserType,
  env: string,
  clientIds: string[]
): Promise<boolean> {
  if (clientIds.length !== 1) {
    logger.warn(
      `User ${user.Username} has ${clientIds.length} associated client IDs (${clientIds.join(
        ', '
      )}). Expected exactly 1. Skipping migration for this user.`
    );
    return false;
  }

  // If user already has the custom attribute populated then skip them
  const attributes = user.Attributes ?? [];
  const existingInternalIdFromUserAttributes = attributes.find(
    (attr) => attr.Name === INTERNAL_ID_ATTRIBUTE
  )?.Value;
  if (existingInternalIdFromUserAttributes) {
    logger.warn(
      `User ${user.Username} already has internal ID attribute populated ${existingInternalIdFromUserAttributes}. Skipping migration for this user.`
    );
    return false;
  }

  // If there is an existing external user mapping then skip them and log an error
  const existingInternalIdFromExternalMapping =
    await findInternalUserIdentifier(user.Username!, env);
  if (existingInternalIdFromExternalMapping) {
    logger.error(
      `User ${user.Username} already has an external user mapping internal ID attribute populated ${existingInternalIdFromExternalMapping}. Skipping migration for this user.`
    );
    return false;
  }

  return true;
}

function findClientIdFromGroups(groups: string[], env: string): string[] {
  const clientGroupPrefix = `client:`;
  return groups
    .filter((group) => group.startsWith(clientGroupPrefix))
    .map((group) => group.replace(clientGroupPrefix, ''));
}

async function migrateSingleUser(
  user: UserType,
  groups: string[],
  userPoolId: string,
  env: string,
  dryRun: boolean
) {
  const clientIds = findClientIdFromGroups(groups, env);
  if (!(await validateUserMigrationPrerequisites(user, env, clientIds))) {
    return;
  }
  const clientId = clientIds[0];

  // Create internal user
  const internalUserId = await createUser(
    user.Username!,
    clientId,
    env,
    dryRun
  );

  // Populate custom user attribute
  await populateInternalUserId(
    user.Username!,
    internalUserId,
    userPoolId,
    dryRun
  );
}

async function runMigration() {
  // Discover user pool ID
  const userPoolId = await discoverUserPoolId(params.env);

  // Extract user from Cognito
  const users = await retrieveUsers(userPoolId);

  // Enhance with group membership
  const usersWithGroups = await retrieveUserGroups(users, userPoolId);

  // Backup existing data
  await backupDataToS3(usersWithGroups, params.env);

  // Migrate data to DynamoDB
  usersWithGroups.forEach(
    async (value: { user: UserType; groups: string[] }, index: number) => {
      const { user, groups } = value;

      await migrateSingleUser(
        user,
        groups,
        userPoolId,
        params.env,
        params.dryRun
      );
      logger.info(
        `${index + 1}/${usersWithGroups.length} (${(100.0 * (index + 1)) / usersWithGroups.length}%) Migrated user ${user.Username}`
      );
    }
  );

  logger.info('Data migration from Cognito to DynamoDB completed successfully');
}

runMigration().catch((error) => {
  logger.error('Migration failed', error);
  process.exit(1);
});
