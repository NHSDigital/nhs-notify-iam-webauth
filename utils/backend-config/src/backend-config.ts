/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'node:fs';

export type BackendConfig = {
  groupTag: string;
  nameTag: string;
  keyDirectorySsmParameterName: string;
};

export const BackendConfigHelper = {
  fromTerraformOutputsFile(filepath: string): BackendConfig {
    const outputs = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    return {
      groupTag: outputs.group_tag.value,
      nameTag: outputs.name_tag.value,
      keyDirectorySsmParameterName: outputs.key_directory_ssm_parameter_name.value
    };
  },

  toEnv(config: BackendConfig): void {
    process.env.GROUP_TAG = config.groupTag;
    process.env.NAME_TAG = config.nameTag;
    process.env.KEY_DIRECTORY_SSM_PARAMETER_NAME = config.keyDirectorySsmParameterName;
  },
};
