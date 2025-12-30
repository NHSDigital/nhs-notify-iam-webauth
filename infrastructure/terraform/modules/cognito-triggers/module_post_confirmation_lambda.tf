module "post_confirmation_lambda" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.29/terraform-lambda.zip"

  project        = var.project
  environment    = var.environment
  component      = var.component
  aws_account_id = var.aws_account_id
  region         = var.region

  function_name = "post-confirmation"
  description   = "Post confirmation handler for Cognito user pool"

  function_s3_bucket      = var.function_s3_bucket
  function_code_base_path = local.lambdas_dir
  function_code_dir       = "cognito-triggers/dist"
  function_module_name    = "post-confirmation"
  handler_function_name   = "handler"

  memory  = 512
  timeout = 3
  runtime = "nodejs20.x"

  lambda_env_vars = {
    USERS_TABLE = aws_dynamodb_table.users.name
  }

  kms_key_arn           = var.kms_key_arn
  log_retention_in_days = var.log_retention_in_days

  send_to_firehose          = var.send_to_firehose
  log_destination_arn       = var.log_destination_arn
  log_subscription_role_arn = var.log_subscription_role_arn

  permission_statements = [{
    statement_id   = "AllowCognitoInvoke"
    principal      = "cognito-idp.amazonaws.com"
    action         = "lambda:InvokeFunction"
    source_arn     = "arn:aws:cognito-idp:${var.region}:${var.aws_account_id}:userpool/${var.user_pool_id}"
    source_account = var.aws_account_id
  }]

  iam_policy_document = {
    body = data.aws_iam_policy_document.post_confirmation_lambda.json
  }
}

data "aws_iam_policy_document" "post_confirmation_lambda" {
  statement {
    sid       = "AllowUpdateCognitoUserAttributes"
    effect    = "Allow"
    actions   = ["cognito-idp:AdminUpdateUserAttributes"]
    resources = ["arn:aws:cognito-idp:${var.region}:${var.aws_account_id}:userpool/${var.user_pool_id}"]
  }

  statement {
    sid    = "AllowDynamoAccess"
    effect = "Allow"

    actions = [
      "dynamodb:Query",
    ]

    resources = [
      aws_dynamodb_table.users.arn,
    ]
  }

  statement {
    sid    = "AllowKMSAccess"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
      "kms:DescribeKey",
      "kms:Encrypt",
      "kms:GenerateDataKey*",
      "kms:ReEncrypt*",
    ]

    resources = [
      var.kms_key_arn
    ]
  }
}
