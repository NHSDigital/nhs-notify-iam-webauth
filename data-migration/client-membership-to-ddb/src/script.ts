import { UserType } from '@aws-sdk/client-cognito-identity-provider';
import { logger } from '@/src/utils/logger';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {
  discoverUserPoolId,
  retrieveUserGroups,
  retrieveUsers,
  INTERNAL_ID_ATTRIBUTE,
  populateInternalUserId,
  removeUserFromGroup,
} from '@/src/utils/aws/cognito-util';
import { backupDataToS3 } from '@/src/utils/backup-util';
import {
  createUser,
  findInternalUserIdentifier,
} from '@/src/utils/users-repository';

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
      `User ${user.Username} has ${clientIds.length} associated client IDs (${clientIds.join(',')}). Expected exactly 1. Skipping migration for this user.`
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
): Promise<boolean> {
  const clientIds = findClientIdFromGroups(groups, env);
  if (!(await validateUserMigrationPrerequisites(user, env, clientIds))) {
    return false;
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

  // Remove user from Cognito group
  await removeUserFromGroup(
    userPoolId,
    user.Username!,
    `client:${clientId}`,
    dryRun
  );
  return true;
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
  let countMigrated = 0;
  let countSkipped = 0;
  const sortedUsers = usersWithGroups.sort((a, b) =>
    a.user.Username!.localeCompare(b.user.Username!)
  );

  for (const userWithGroups of sortedUsers) {
    const { user, groups } = userWithGroups;

    const migrationResult = await migrateSingleUser(
      user,
      groups,
      userPoolId,
      params.env,
      params.dryRun
    );

    if (migrationResult) {
      countMigrated++;
    } else {
      countSkipped++;
    }

    logger.info(
      `Migrated ${countMigrated}, Skipped ${countSkipped}, Total ${countMigrated + countSkipped}/${usersWithGroups.length} (${(100.0 * (countMigrated + countSkipped)) / usersWithGroups.length}%) Processed user ${user.Username}`
    );
  }

  logger.info(
    `User migration summary: Migrated ${countMigrated} users, Skipped ${countSkipped} users.  About to clean up cognito groups.`
  );

  // Remove empty client groups

  logger.info('Data migration from Cognito to DynamoDB completed successfully');
}

runMigration().catch((error) => {
  logger.error('Migration failed', error);
  process.exit(1);
});
