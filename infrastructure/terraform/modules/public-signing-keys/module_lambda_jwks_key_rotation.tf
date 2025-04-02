module "lambda_jwks_key_rotation" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda?ref=v1.0.9"

  providers = {
    aws = aws
  }

  function_name = "jwks-key-rotation"
  description   = "A function for rotating CIS2 JWKS signing keys"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = "eu-west-2"
  group          = var.group

  log_retention_in_days = var.log_retention_in_days
  kms_key_arn           = module.kms.key_arn

  iam_policy_document = {
    body = data.aws_iam_policy_document.lambda_jwks_key_rotation.json
  }

  function_s3_bucket       = local.acct.s3_buckets["lambda_function_artefacts"]["id"]
  function_code_base_path  = local.aws_lambda_functions_dir_path
  function_code_dir        = "jwks-key-rotation/src"
  function_include_common  = true
  function_module_name     = "handler"
  runtime                  = "nodejs20.x"
  memory                   = 128
  timeout                  = 5
  log_level                = var.log_level
  schedule                 = "rate(10 minutes)"
  force_lambda_code_deploy = true
}

data "aws_iam_policy_document" "lambda_jwks_key_rotation" {
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
}
