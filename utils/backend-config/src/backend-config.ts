/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'node:fs';

export type BackendConfig = {
  groupTag: string;
  nameTag: string;
  keyDirectorySsmParameterName: string;
  keyRotationLambdaName: string;
  publicKeysS3BucketName: string;
  region: string;
  accountId: string;
};

export const BackendConfigHelper = {
  fromTerraformOutputsFile(filepath: string): BackendConfig {
    const outputs = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    return {
      groupTag: outputs.group_tag.value,
      nameTag: outputs.name_tag.value,
      keyDirectorySsmParameterName: outputs.key_directory_ssm_parameter_name.value,
      keyRotationLambdaName: outputs.key_rotation_lambda_name.value,
      publicKeysS3BucketName: outputs.public_keys_s3_bucket_name.value,
      region: outputs.deployment.value.aws_region,
      accountId: outputs.deployment.value.aws_account_id
    };
  },

  toEnv(config: BackendConfig): void {
    process.env.GROUP_TAG = config.groupTag;
    process.env.NAME_TAG = config.nameTag;
    process.env.KEY_DIRECTORY_SSM_PARAMETER_NAME = config.keyDirectorySsmParameterName;
    process.env.KEY_ROTATION_LAMBDA_NAME = config.keyRotationLambdaName;
    process.env.PUBLIC_KEYS_S3_BUCKET_NAME = config.publicKeysS3BucketName;
    process.env.ACCOUNT_ID = config.accountId;
    process.env.REGION = config.region;
  },
};
