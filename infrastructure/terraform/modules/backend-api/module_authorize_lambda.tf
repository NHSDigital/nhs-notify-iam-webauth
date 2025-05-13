module "authorize_lambda" {
  source      = "../lambda-function"
  description = "CIS2 authorize lambda"

  function_name    = "${local.csi}-authorize"
  filename         = module.build_cis2_lambdas.zips["src/authorize-handler.ts"].path
  source_code_hash = module.build_cis2_lambdas.zips["src/authorize-handler.ts"].base64sha256
  runtime          = "nodejs20.x"
  handler          = "authorize-handler.handler"

  log_retention_in_days = var.log_retention_in_days

  environment_variables = {
    CIS2_URL = var.cis2_url
  }
  destination_arn       = var.destination_arn
  subscription_role_arn = var.subscription_role_arn
}
