import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

const client = new SSMClient({ region: 'eu-west-2' });

export async function getSsmParameterValue(name: string): Promise<string> {
  return client
    .send(new GetParameterCommand({ Name: name, WithDecryption: true }))
    .then((result) => result.Parameter?.Value || '')
    .catch((err) => {
      console.log(err);
      throw err;
    });
}
