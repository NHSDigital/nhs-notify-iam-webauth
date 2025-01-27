module "proxy_lambda" {
  source      = "../lambda-function"
  description = "Update template API endpoint"

  function_name    = "${local.csi}-proxy"
  filename         = module.build_proxy_lambda.zips["src/handler.ts"].path
  source_code_hash = module.build_proxy_lambda.zips["src/handler.ts"].base64sha256
  runtime          = "nodejs20.x"
  handler          = "handler.handler"

  log_retention_in_days = var.log_retention_in_days

  environment_variables = {
    CIS2_URL = var.cis2_url
  }
}
