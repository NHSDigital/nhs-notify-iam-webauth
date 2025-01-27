resource "aws_api_gateway_stage" "main" {
  stage_name    = var.environment
  description   = "Templates API stage ${var.environment}"
  rest_api_id   = aws_api_gateway_rest_api.main.id
  deployment_id = aws_api_gateway_deployment.main.id
}
