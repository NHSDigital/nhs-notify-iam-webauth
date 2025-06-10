import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { FullConfig } from '@playwright/test';
import generate from 'generate-password';
import { AmplifyConfigurationHelper } from '../helpers/amplify-configuration-helper';
import { BackendConfigHelper } from 'nhs-notify-iam-webauth-util-backend-config';

async function globalSetup(config: FullConfig) {
  const configHelper = new AmplifyConfigurationHelper();

  const backendConfig = BackendConfigHelper.fromTerraformOutputsFile(
    path.join(__dirname, '..', '..', '..', 'sandbox_tf_outputs.json')
  );

  BackendConfigHelper.toEnv(backendConfig);

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
  process.env.USER_EMAIL_PREFIX = randomUUID().slice(0, 5);

  return config;
}

export default globalSetup;
