module "token_lambda" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda?ref=v2.0.4"

  project        = var.project
  environment    = var.environment
  component      = var.component
  aws_account_id = var.aws_account_id
  region         = var.region

  kms_key_arn = var.kms_key_arn

  function_name = "token"

  function_module_name  = "token-handler"
  handler_function_name = "handler"
  description           = "CIS2 token lambda"

  memory  = 512
  timeout = 20
  runtime = "nodejs20.x"

  log_retention_in_days = var.log_retention_in_days

  lambda_env_vars = {
    EXPECTED_ID_ASSURANCE_LEVEL                   = "3"
    EXPECTED_AUTHENTICATION_ASSURANCE_LEVEL       = "2"
    MAXIMUM_EXPECTED_AUTH_TIME_DIVERGENCE_SECONDS = "60"
    CIS2_URL                                      = var.cis2_url
    CIS2_AUTH_MODE                                = var.cis2_auth_mode
    SSM_KEY_DIRECTORY_NAME                        = var.ssm_key_directory_name
  }

  function_s3_bucket      = var.function_s3_bucket
  function_code_base_path = local.lambdas_dir
  function_code_dir       = "cis2-api/dist"

  send_to_firehose          = true
  log_destination_arn       = var.log_destination_arn
  log_subscription_role_arn = var.log_subscription_role_arn

  iam_policy_document = {
    body = data.aws_iam_policy_document.token_lambda.json
  }
}

data "aws_iam_policy_document" "token_lambda" {
  statement {
    sid    = "AllowSSMParametersRead"
    effect = "Allow"
    actions = [
      "ssm:GetParameter"
    ]
    resources = [
      "arn:aws:ssm:${var.region}:${var.aws_account_id}:parameter${var.ssm_key_directory_name}"
    ]
  }

  statement {
    sid    = "AllowKmsSign"
    effect = "Allow"
    actions = [
      "kms:Sign"
    ]
    resources = [
      "arn:aws:kms:${var.region}:${var.aws_account_id}:key/*"
    ]
    condition {
      test     = "StringEquals"
      variable = "aws:ResourceTag/Usage"
      values = [
        "CIS2-JWKS-AUTH"
      ]
    }
  }
}
