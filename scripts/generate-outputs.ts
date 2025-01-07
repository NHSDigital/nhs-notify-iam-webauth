import { writeFileSync, readFileSync } from 'node:fs';

const inputType = process.argv[2];

let userPoolId: string;
let userPoolClientId: string;

if (inputType === 'file') {
    const outputsFileContent = JSON.parse(readFileSync('./sandbox_tf_outputs.json').toString());

    userPoolId = outputsFileContent.cognito_user_pool_id.value;
    userPoolClientId = outputsFileContent.cognito_user_pool_client_id.value;
} else if (inputType === 'env') {
    userPoolId = process.env.USER_POOL_ID ?? 'unknown-user-pool-id';
    userPoolClientId = process.env.USER_POOL_CLIENT_ID ?? 'unknown-user-pool-client-id';
} else {
    throw new Error('Unexpected input type');
}

writeFileSync('./amplify_outputs.json', JSON.stringify({
    version: '1.3',
    auth: {
        aws_region: 'eu-west-2',
        user_pool_id: userPoolId,
        user_pool_client_id: userPoolClientId,
    }
}));