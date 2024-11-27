import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'eu-west-2' });

export async function getSecret<T>(secretId: string): Promise<T> {
  return client
    .send(new GetSecretValueCommand({ SecretId: secretId }))
    .then((result) => result.SecretString || '{}')
    .then((data) => JSON.parse(data) as T)
    .catch((err) => {
      console.log(err);
      throw err;
    });
}
