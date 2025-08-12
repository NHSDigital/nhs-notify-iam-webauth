module "pre_authentication_lambda" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda?ref=v2.0.11"

  project        = var.project
  environment    = var.environment
  component      = var.component
  aws_account_id = var.aws_account_id
  region         = var.region

  function_name = "pre-authentication"
  description   = "Pre-authentication handler for Cognito user pool"

  function_s3_bucket      = var.function_s3_bucket
  function_code_base_path = local.lambdas_dir
  function_code_dir       = "cognito-triggers/dist"
  function_module_name    = "pre-authentication"
  handler_function_name   = "handler"

  memory  = 512
  timeout = 3
  runtime = "nodejs20.x"

  kms_key_arn           = var.kms_key_arn
  log_retention_in_days = var.log_retention_in_days

  permission_statements = [{
    statement_id   = "AllowCognitoInvoke"
    principal      = "cognito-idp.amazonaws.com"
    action         = "lambda:InvokeFunction"
    source_arn     = "arn:aws:cognito-idp:${var.region}:${var.aws_account_id}:userpool/${var.user_pool_id}"
    source_account = var.aws_account_id
  }]

  iam_policy_document = {
    body = data.aws_iam_policy_document.pre_authentication_lambda.json
  }
}

data "aws_iam_policy_document" "pre_authentication_lambda" {
  statement {
    sid       = "AllowListCognitoGroups"
    effect    = "Allow"
    actions   = ["cognito-idp:AdminListGroupsForUser"]
    resources = ["arn:aws:cognito-idp:${var.region}:${var.aws_account_id}:userpool/${var.user_pool_id}"]
  }
}
