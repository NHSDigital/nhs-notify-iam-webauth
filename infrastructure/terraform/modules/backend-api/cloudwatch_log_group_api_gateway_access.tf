resource "aws_cloudwatch_log_group" "api_gateway_access" {
  name              = "/aws/api-gateway/${aws_api_gateway_rest_api.main.id}/${var.environment}/access-logs"
  retention_in_days = var.log_retention_in_days
}

resource "aws_cloudwatch_log_subscription_filter" "api_gateway_access" {
  name            = replace(aws_cloudwatch_log_group.api_gateway_access.name, "/", "-")
  log_group_name  = aws_cloudwatch_log_group.api_gateway_access.name
  filter_pattern  = ""
  destination_arn = var.destination_arn
  role_arn        = var.subscription_role_arn
}
