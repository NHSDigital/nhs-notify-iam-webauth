module "lambda_backup_cognito_id" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda?ref=v1.0.8"

  function_name = "backup-cognito-id"
  description   = "A function for backing up Cognito User IDs"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region
  group          = var.group

  log_retention_in_days = var.log_retention_in_days
  kms_key_arn           = module.kms.key_arn

  iam_policy_document = {
    body = data.aws_iam_policy_document.lambda_backup_cognito_id.json
  }

  function_s3_bucket      = local.acct.s3_buckets["lambda_function_artefacts"]["id"]
  function_code_base_path = local.aws_lambda_functions_dir_path
  function_code_dir       = "backup-cognito-id/src"
  function_include_common = true
  function_module_name    = "index"
  handler_function_name   = "handler"
  runtime                 = "nodejs20.x"
  memory                  = 128
  timeout                 = 5
  log_level               = var.log_level
  lambda_at_edge          = true

  force_lambda_code_deploy = var.force_lambda_code_deploy
  enable_lambda_insights   = false

  lambda_env_vars = {
    S3_BUCKET_NAME = module.s3bucket_cognito_backup.bucket
  }
}

data "aws_iam_policy_document" "lambda_backup_cognito_id" {
  statement {
    sid    = "KMSPermissions"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey",
    ]

    resources = [
      module.kms.key_arn,
    ]
  }

  statement {
    sid    = "CognitoPermissions"
    effect = "Allow"

    actions = [
      "cognito-idp:AdminGetUser",
    ]

    resources = [
      aws_cognito_user_pool.main.arn,
    ]
  }

  statement {
    sid    = "S3Permissions"
    effect = "Allow"

    actions = [
      "s3:DeleteObject",
      "s3:PutObject",
      "s3:PutObjectACL",
    ]

    resources = [
      "${module.s3bucket_cognito_backup.arn}/*"
    ]
  }

}
