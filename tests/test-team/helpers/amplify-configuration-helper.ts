import * as fs from 'node:fs';

type AmplifyOutput = {
  auth: {
    user_pool_id: string;
    user_pool_client_id: string;
    identity_pool_id: string;
  };
};

export class AmplifyConfigurationHelper {
  private readonly configuration: AmplifyOutput;

  constructor() {
    this.configuration = JSON.parse(
      fs.readFileSync('../../amplify_outputs.json', 'utf8')
    );
  }

  getUserPoolId() {
    return this.configuration.auth.user_pool_id;
  }
}
