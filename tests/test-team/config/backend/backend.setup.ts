import path from 'node:path';
import { test as setup } from '@playwright/test';
import { BackendConfigHelper } from 'nhs-notify-iam-webauth-util-backend-config';

setup('backend test setup', async () => {
  const backendConfig = BackendConfigHelper.fromTerraformOutputsFile(
    // eslint-disable-next-line unicorn/prefer-module
    path.join(__dirname, '..', '..', '..', '..', 'sandbox_tf_outputs.json')
  );

  BackendConfigHelper.toEnv(backendConfig);
});
