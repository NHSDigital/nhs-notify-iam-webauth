locals {
  csi = "${var.csi}-${var.component}"

  lambdas_dir = "../../../../lambdas"

  openapi_spec = templatefile("${path.module}/spec.tmpl.json", {
    AWS_REGION              = var.region
    APIG_EXECUTION_ROLE_ARN = aws_iam_role.api_gateway_execution_role.arn
    AUTHORIZE_LAMBDA_ARN    = module.authorize_lambda.function_arn
    TOKEN_LAMBDA_ARN        = module.token_lambda.function_arn
  })
}
