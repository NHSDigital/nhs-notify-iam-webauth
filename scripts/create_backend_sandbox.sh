#!/bin/bash

set -euo pipefail

# expect 1 argument to the script
if [ $# -ne 1 ]; then
  echo 1>&2 "$0: expected 1 arguments, received $#"
  exit 2
fi

ENVIRONMENT=$1
COMPONENT="sbx"
AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
AWS_REGION="eu-west-2"
PROJECT="nhs-notify"
GROUP="nhs-notify-iam-dev"

root_dir=$(git rev-parse --show-toplevel)
terraform_dir=$root_dir/infrastructure/terraform
component_dir=$terraform_dir/components/$COMPONENT

echo "Creating backend sandbox \"$ENVIRONMENT\""

cd $terraform_dir

./bin/terraform.sh \
  --project $PROJECT \
  --region $AWS_REGION \
  --component $COMPONENT \
  --environment $ENVIRONMENT \
  --group $GROUP \
  --action apply \
  -- \
  -var aws_account_id=$AWS_ACCOUNT_ID \
  -var region=$AWS_REGION \
  -var project=$PROJECT \
  -var environment=$ENVIRONMENT \
  -var group=$GROUP

cd $component_dir

# This is lifted from infrastructure/terraform/bin/terraform.sh
# That script creates and deletes its own terraform backend configuration, and then deletes it again
# We can run the `output` command with the terraform.sh script, but can't write the output to a file
# because it prints loads of other things to stdout too
# so we need to reconfigure the backend and run the init/output commands using the terraform binary directly

# create tf backend config
bucket="${PROJECT}-tfscaffold-${AWS_ACCOUNT_ID}-${AWS_REGION}"
backend_prefix="${PROJECT}/${AWS_ACCOUNT_ID}/${AWS_REGION}/${ENVIRONMENT}";
backend_filename="${COMPONENT}.tfstate";

readonly backend_key="${backend_prefix}/${backend_filename}";
readonly backend_config="terraform {
  backend \"s3\" {
    region         = \"${AWS_REGION}\"
    bucket         = \"${bucket}\"
    key            = \"${backend_key}\"
    use_lockfile   = true
  }
}";

# write the backend file
echo -e "${backend_config}" > backend_tfscaffold.tf

# clean up the file on exit
trap "rm -f $(pwd)/backend_tfscaffold.tf" EXIT;

# create the outputs file
terraform output -json > ${root_dir}/sandbox_tf_outputs.json

npm run generate-outputs sandbox-output
