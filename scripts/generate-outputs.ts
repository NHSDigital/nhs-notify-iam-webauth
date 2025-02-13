import { writeFileSync, readFileSync } from 'node:fs';

const inputType = process.argv[2];

// client and server
let userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID || '';
let userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || '';
let cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || '';
let redirectDomain = process.env.NEXT_PUBLIC_REDIRECT_DOMAIN || '';
let signoutRedirectDomain = process.env.NEXT_PUBLIC_SIGNOUT_REDIRECT_DOMAIN || '';
let cis2ProviderName = process.env.NEXT_PUBLIC_CIS2_PROVIDER_NAME || '';
let enableCognitoIdp = process.env.NEXT_PUBLIC_ENABLE_COGNITO_IDP || '';

if (inputType === 'sandbox-output') {
  const outputsFileContent = JSON.parse(readFileSync('./sandbox_tf_outputs.json').toString());

  userPoolId = outputsFileContent.cognito_user_pool_id.value;
  userPoolClientId = outputsFileContent.cognito_user_pool_client_id.value;
  cognitoDomain = outputsFileContent.cognito_domain.value;
  redirectDomain = outputsFileContent.redirect_domain.value;
  signoutRedirectDomain = outputsFileContent.signout_redirect_domain.value;
  cis2ProviderName = outputsFileContent.cis2_provider_name.value;
  enableCognitoIdp = 'true' // always enable cognito idp if we're using a sandbox backend
} else if (inputType === 'env') {
  // do nothing
} else {
  throw new Error('Unexpected input type');
}

writeFileSync('./.env', `
# client and server
NEXT_PUBLIC_USER_POOL_ID=${userPoolId}
NEXT_PUBLIC_USER_POOL_CLIENT_ID=${userPoolClientId}
NEXT_PUBLIC_COGNITO_DOMAIN=${cognitoDomain}
NEXT_PUBLIC_REDIRECT_DOMAIN=${redirectDomain}
NEXT_PUBLIC_SIGNOUT_REDIRECT_DOMAIN=${signoutRedirectDomain}
NEXT_PUBLIC_CIS2_PROVIDER_NAME=${cis2ProviderName}
NEXT_PUBLIC_ENABLE_COGNITO_IDP=${enableCognitoIdp}
`);

const amplifyOutputs = {
  version: '1.3',
  auth: {
    aws_region: 'eu-west-2',
    user_pool_id: userPoolId,
    user_pool_client_id: userPoolClientId,
    oauth: {
      identity_providers: [cis2ProviderName],
      domain: cognitoDomain,
      scopes: ['email', 'openid', 'aws.cognito.signin.user.admin'],
      redirect_sign_in_uri: [redirectDomain],
      redirect_sign_out_uri: [signoutRedirectDomain],
      response_type: 'code',
    },
  },
};

writeFileSync('./amplify_outputs.json', JSON.stringify(amplifyOutputs, undefined, 2));
