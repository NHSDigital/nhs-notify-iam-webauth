import { FullConfig } from '@playwright/test';
import generate from 'generate-password';
import { v4 as uuidv4 } from 'uuid';
import { AmplifyConfigurationHelper } from '@helpers/amplify-configuration-helper';

async function globalSetup(config: FullConfig) {
  const configHelper = new AmplifyConfigurationHelper();

  const [temporary, password] = generate.generateMultiple(2, {
    length: 12,
    numbers: true,
    uppercase: true,
    symbols: true,
    strict: true,
  });

  process.env.AWS_COGNITO_USER_POOL_ID = configHelper.getUserPoolId();
  process.env.TEMPORARY_USER_PASSWORD = temporary;
  process.env.USER_PASSWORD = password;
  process.env.USER_EMAIL_PREFIX = uuidv4().slice(0, 5);

  return config;
}

export default globalSetup;
