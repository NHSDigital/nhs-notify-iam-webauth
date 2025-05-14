resource "aws_cloudwatch_log_subscription_filter" "firehose" {
  count = var.log_destination_arn != "" ? 1 : 0
  name            = replace(aws_cloudwatch_log_group.lambda.name, "/", "-")
  log_group_name  = aws_cloudwatch_log_group.lambda.name
  filter_pattern  = var.filter_pattern
  destination_arn = var.log_destination_arn
  role_arn        = var.log_subscription_role_arn
}
