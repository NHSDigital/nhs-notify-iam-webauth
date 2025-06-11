module "pre_token_generation_lambda" {
  source = "../../../../../nhs-notify-shared-modules/infrastructure/modules/lambda"

  project        = var.project
  environment    = var.environment
  component      = var.component
  aws_account_id = var.aws_account_id
  region         = var.region

  function_name = "pre-token-generation"
  description   = "Pre token generation handler for Cognito user pool"

  # function code
  function_s3_bucket      = var.function_s3_bucket
  function_code_base_path = local.lambdas_dir
  function_code_dir       = "cognito-triggers/dist"
  function_module_name    = "pre-token-generation"
  handler_function_name   = "handler"

  // function config
  memory  = 128
  timeout = 3
  runtime = "nodejs20.x"
  lambda_env_vars = {
    CLIENT_CONFIG_PARAMETER_PATH_PREFIX = local.client_config_parameter_path_prefix
  }

  # logs
  kms_key_arn           = var.kms_key_arn
  log_retention_in_days = var.log_retention_in_days

  # permissions
  permission_statements = [{
    statement_id   = "AllowCognitoInvoke"
    principal      = "cognito-idp.amazonaws.com"
    action         = "lambda:InvokeFunction"
    source_arn     = "arn:aws:cognito-idp:${var.region}:${var.aws_account_id}:userpool/${var.user_pool_id}"
    source_account = var.aws_account_id
  }]

  iam_policy_document = {
    body = data.aws_iam_policy_document.pre_token_generation_lambda.json
  }
}

data "aws_iam_policy_document" "pre_token_generation_lambda" {
  statement {
    sid       = "AllowGetClientParameters"
    effect    = "Allow"
    actions   = ["ssm:GetParameter"]
    resources = ["arn:aws:ssm:${var.region}:${var.aws_account_id}:parameter${local.client_config_parameter_path_prefix}*"]
  }

  statement {
    sid       = "AllowKMSDecryptClientParameters"
    effect    = "Allow"
    actions   = ["kms:Decrypt"]
    resources = [var.kms_key_arn]

    condition {
      test     = "StringLike"
      variable = "kms:EncryptionContext:PARAMETER_ARN"
      values   = ["arn:aws:ssm:${var.region}:${var.aws_account_id}:parameter${local.client_config_parameter_path_prefix}*"]
    }
  }
}
