module "pre_authentication_lambda" {
  depends_on = [module.build_pre_authentication_lambda]

  source      = "../../modules/lambda-function"
  description = "Pre authentication lambda trigger"

  function_name    = "${local.csi}-pre-authentication"
  filename         = module.build_pre_authentication_lambda.zips["src/handler.ts"].path
  source_code_hash = module.build_pre_authentication_lambda.zips["src/handler.ts"].base64sha256
  runtime          = "nodejs20.x"
  handler          = "handler.handler"

  log_retention_in_days = var.log_retention_in_days

  environment_variables = {
    EXPECTED_ID_ASSURANCE_LEVEL                   = "3"
    EXPECTED_AUTHENTICATION_ASSURANCE_LEVEL       = "2"
    MAXIMUM_EXPECTED_AUTH_TIME_DIVERGENCE_SECONDS = "60"
  }
}

resource "aws_lambda_permission" "cognito" {
  action        = "lambda:InvokeFunction"
  function_name = module.pre_authentication_lambda.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.main.arn

  statement_id = "cognito-permission"
}