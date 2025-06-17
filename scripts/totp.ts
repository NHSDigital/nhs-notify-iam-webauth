import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { TOTP } from "totp-generator"

// This script is for generating an OTP for manual CIS2 login in a Static Environment
// Do not use it for test automation or in sandbox environments!
(async function main(){
  const { SecretString } = await new SecretsManagerClient().send(new GetSecretValueCommand({
    SecretId: 'test/cis2-int/credentials',
  }))

  if (!SecretString) {
    throw new Error('No SecretString returned from Secrets Manager.')
  }

  const { totpSecret } = JSON.parse(SecretString);

  if (!totpSecret) {
    throw new Error('TOTP Secret not found in Secrets Manager.')
  }

  const { otp } = TOTP.generate(totpSecret);

  console.log(otp) // eslint-disable-line no-console
})();
