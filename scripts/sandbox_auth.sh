#!/bin/bash

set -euo pipefail

root_dir=$(git rev-parse --show-toplevel)

# expect 2 argument to the script
if [ $# -ne 2 ]; then
  echo 1>&2 "$0: expected 2 arguments, received $#"
  exit 2
fi

email=$1
password=$2

cognito_user_pool_id=$(jq -r .cognito_user_pool_id.value $root_dir/sandbox_tf_outputs.json)
cognito_user_pool_client_id=$(jq -r .cognito_user_pool_client_id.value $root_dir/sandbox_tf_outputs.json)

set +e # if the user doesn't exist, we expect this command to fail
get_user_command_output=$(aws cognito-idp admin-get-user --user-pool-id "$cognito_user_pool_id" --username "$email" 2>&1)
get_user_command_exit_code=$?
set -e #re-enable

function gen_temp_password() {
  upper=$(LC_ALL=C tr -dc 'A-Z' </dev/urandom | head -c 4; echo)
  lower=$(LC_ALL=C tr -dc 'a-z' </dev/urandom | head -c 4; echo)
  digits=$(LC_ALL=C tr -dc '0-9' </dev/urandom | head -c 4; echo)
  echo "${upper}-${lower}-${digits}"
}
 
declare temp_password

if [[ "$get_user_command_exit_code" -ne 0 ]]; then
  echo "Get user failed - $(xargs <<< $get_user_command_output)"
  echo "Attempting to create user"

  temp_password=$(gen_temp_password)

  aws cognito-idp admin-create-user \
    --user-pool-id "${cognito_user_pool_id}" \
    --username "${email}" \
    --user-attributes Name=email,Value=${email} Name=email_verified,Value=True \
    --temporary-password "${temp_password}" \
    --desired-delivery-mediums EMAIL \
    --message-action SUPPRESS
fi

declare login_password
if [[ -z "${temp_password}" ]]; then
  login_password=$password
else
  login_password=$temp_password
fi

auth_response=$(aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id "${cognito_user_pool_client_id}" \
  --auth-parameters USERNAME="${email}",PASSWORD="${login_password}" \
  --output json)

challenge_name=$(jq -r .ChallengeName <<< $auth_response)

declare authentication_result

if [[ $challenge_name == "NEW_PASSWORD_REQUIRED" ]]; then
  session=$(jq -r .Session <<< $auth_response)

  challenge_response=$(aws cognito-idp respond-to-auth-challenge \
    --client-id "${cognito_user_pool_client_id}" \
    --challenge-name NEW_PASSWORD_REQUIRED \
    --session "${session}" \
    --challenge-responses USERNAME="${email}",NEW_PASSWORD="${password}")

  authentication_result=$(jq -r .AuthenticationResult <<< $challenge_response)
else
  authentication_result=$(jq -r .AuthenticationResult <<< $auth_response)
fi

echo $authentication_result | jq '.' > $root_dir/sandbox_cognito_auth_token.json

echo "Credentials written to $root_dir/sandbox_cognito_auth_token.json"
