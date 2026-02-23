import { logger } from '@/src/utils/logger';
import { AdminCreateUserCommand, CognitoIdentityProviderClient, UserType } from '@aws-sdk/client-cognito-identity-provider';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { discoverUserPoolId, retrieveUsers } from '../utils/aws/cognito-utils';
import { readFileSync, writeFileSync } from 'node:fs';

type Inputs = {
  action: 'export' | 'import';
  env: string;
  userDetailsFile?: string;
};

const cognitoClient = new CognitoIdentityProviderClient({
  region: "eu-west-2",
});

function readParams(): Inputs {
  return yargs(hideBin(process.argv))
    .options({
      action: {
        type: 'string',
        choices: ['export', 'import'],
        demandOption: true,
      },
      env: {
        type: 'string',
        demandOption: true,
      },
      userDetailsFile: {
        type: 'string',
        default: undefined,
      },
    })
    .parseSync() as Inputs;
}

function flattenAttributes(user: UserType) {
  return user.Attributes?.reduce((acc, attribute) => {
    if (attribute.Name && attribute.Value) {
      acc[attribute.Name] = attribute.Value;
    }
    return acc;
  }, {} as Record<string, string>);
}

function getTimestamp(): string {
  return new Date().toISOString().replaceAll(/[.:T-]/g, '');
}

export async function runMigration() {
  const { action, env, userDetailsFile } = readParams();

  logger.info(`Starting user migration with action '${action}' in environment '${env}'`);

  const userPoolId = await discoverUserPoolId(env);
  if (action === 'export') {
    const users = await retrieveUsers(userPoolId);

    const transformedUsers = users.filter((user) => user.UserStatus !== 'EXTERNAL_PROVIDER')
      .map((user) => ({ username: user.Username, ...flattenAttributes(user) }))
      .filter((user) => Boolean((user as Record<string, unknown>)['custom:nhs_notify_user_id']))
      .filter((user) => Boolean((user as Record<string, unknown>).email));
    logger.info(`Found ${transformedUsers.length} users to export`);

    const filePath = `cognito-user-migration-export-${env}-${getTimestamp()}.json`;
    writeFileSync(filePath, JSON.stringify(transformedUsers, null, 2));
    logger.info(`Exported user details to ${filePath}`);
  } else if (action === 'import') {
    if (!userDetailsFile) {
      throw new Error('userDetailsFile parameter is required for import action');
    }
    const fileContents = readFileSync(userDetailsFile, 'utf-8');
    logger.info(`Read user details from ${userDetailsFile}`);
    const userDetails = JSON.parse(fileContents);
    logger.info(`Parsed details for ${userDetails.length} users to import`);
    for (const user of userDetails) {
      logger.info(`Importing user ${user.username} / ${user.email}`);
      await cognitoClient.send(new AdminCreateUserCommand({
        UserPoolId: userPoolId,
        Username: user.email,
        UserAttributes: [
          { Name: 'email', Value: user.email },
          { Name: 'custom:nhs_notify_user_id', Value: user['custom:nhs_notify_user_id'] },
        ],
      })).then(() => {
        logger.info(`Successfully imported user ${user.username}`);
      }).catch((error) => {
        logger.error(`Failed to import user ${user.username}: ${error}`);
      });
    }
  } else {
    throw new Error(`Unknown action: ${action}`);
  }

  return 'done';
}
