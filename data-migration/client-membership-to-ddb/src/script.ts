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
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { discoverUserPoolId, retrieveUserGroups, retrieveUsers } from '@/src/utils/aws/cognito-util';
import { backupDataToS3 } from './utils/backup-util';

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

async function migrateSingleUser(user: UserType, groups: string[], userPoolId: string, dryRun: boolean) {


  // Create internal user
  // Create external user mapping
  // Populate custom user attribute
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
  usersWithGroups.forEach(async ({ user, groups }) => {
    logger.info(`Migrating user ${user.Username} with groups: ${groups.join(', ')}`);
    await migrateSingleUser(user, groups, userPoolId, params.dryRun);
  });


  logger.info('Data migration from Cognito to DynamoDB completed successfully');
}

runMigration().catch((error) => {
  logger.error('Migration failed', error);
  process.exit(1);
});
