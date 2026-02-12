import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { TOTP } from "totp-generator";

const ssmClient = new SSMClient({
  region: process.env.REGION,
  retryMode: 'standard',
  maxAttempts: 10,
});

// This script is for generating an OTP for manual CIS2 login in a Static Environment
// Do not use it for test automation or in sandbox environments!
(async function main(){
  const { Parameter } = await new SSMClient().send(new GetParameterCommand({
    Name: '/test/cis2-int/credentials',
    WithDecryption: true,
  }));
  const parameterValue = Parameter?.Value;

  if (!parameterValue) {
    throw new Error('No Value returned from SSM Parameter Store.')
  }

  const { totpSecret } = JSON.parse(parameterValue);
  if (!totpSecret) {
    throw new Error('TOTP Secret not found in Secrets Manager.')
  }

  const { otp } = TOTP.generate(totpSecret);

  console.log(otp) // eslint-disable-line no-console
})();
