#!/bin/bash

set -euo pipefail

root_dir=$(git rev-parse --show-toplevel)
terraform_dir=$root_dir/infrastructure/terraform

# expect 1 argument to the script
if [ $# -ne 1 ]; then
  echo 1>&2 "$0: expected 1 arguments, received $#"
  exit 2
fi

AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
AWS_REGION="eu-west-2"
PROJECT="nhs-notify"
GROUP="nhs-notify-iam-dev"

identifier=$1

echo "Destroying backend sandbox \"$identifier\""

cd $terraform_dir

./bin/terraform.sh \
  --project $PROJECT \
  --region $AWS_REGION \
  --component sandbox \
  --environment $identifier \
  --group $GROUP \
  --action destroy \
  -- \
  -var aws_account_id=$AWS_ACCOUNT_ID \
  -var region=$AWS_REGION \
  -var project=$PROJECT \
  -var environment=$identifier \
  -var group=$GROUP
