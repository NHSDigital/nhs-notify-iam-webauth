module "post_authentication_lambda" {
  source      = "../lambda-function"
  description = "Cognito post-authentication trigger"

  function_name    = "${local.csi}-post-authentication"
  filename         = module.build_cognito_trigger_lambdas.zips["src/post-authentication.ts"].path
  source_code_hash = module.build_cognito_trigger_lambdas.zips["src/post-authentication.ts"].base64sha256
  runtime          = "nodejs20.x"
  handler          = "post-authentication.handler"

  log_retention_in_days = var.log_retention_in_days

  resource_policies = {
    cognito = {
      statement_id   = "AllowCognito"
      action         = "lambda:InvokeFunction"
      principal      = "cognito-idp.amazonaws.com"
      source_arn     = var.user_pool.arn
      source_account = var.aws_account_id
    }
  }

  execution_role_policy_document = data.aws_iam_policy_document.post_authentication_lambda_policy.json
}

data "aws_iam_policy_document" "post_authentication_lambda_policy" {
  statement {
    sid    = "AllowGlobalSignout"
    effect = "Allow"

    actions = [
      "cognito-idp:AdminUserGlobalSignOut",
    ]

    resources = [
      var.user_pool.arn
    ]
  }
}

