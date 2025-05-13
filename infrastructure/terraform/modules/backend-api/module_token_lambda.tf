module "token_lambda" {
  source      = "../lambda-function"
  description = "CIS2 token lambda"

  function_name    = "${local.csi}-token"
  filename         = module.build_cis2_lambdas.zips["src/token-handler.ts"].path
  source_code_hash = module.build_cis2_lambdas.zips["src/token-handler.ts"].base64sha256
  runtime          = "nodejs20.x"
  handler          = "token-handler.handler"

  log_retention_in_days = var.log_retention_in_days

  environment_variables = {
    EXPECTED_ID_ASSURANCE_LEVEL                   = "3"
    EXPECTED_AUTHENTICATION_ASSURANCE_LEVEL       = "2"
    MAXIMUM_EXPECTED_AUTH_TIME_DIVERGENCE_SECONDS = "60"
    CIS2_URL                                      = var.cis2_url
  }
  destination_arn               = var.destination_arn
  subscription_role_arn = var.subscription_role_arn
}
