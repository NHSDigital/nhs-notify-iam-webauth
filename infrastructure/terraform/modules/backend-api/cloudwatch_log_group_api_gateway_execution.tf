resource "aws_cloudwatch_log_group" "api_gateway_execution" {
  name = format("API-Gateway-Execution-Logs_%s/%s",
    aws_api_gateway_rest_api.main.id,
    var.environment,
  )
  retention_in_days = var.log_retention_in_days
}

resource "aws_cloudwatch_log_subscription_filter" "api_gateway_execution" {
  count = var.cloudwatch_log_destination_arn != "" ? 1 : 0
  name            = replace(aws_cloudwatch_log_group.api_gateway_execution.name, "/", "-")
  log_group_name  = aws_cloudwatch_log_group.api_gateway_execution.name
  filter_pattern  = ""
  destination_arn = var.cloudwatch_log_destination_arn
  role_arn        = var.log_subscription_role_arn
}
