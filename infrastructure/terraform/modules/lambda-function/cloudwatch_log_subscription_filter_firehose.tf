resource "aws_cloudwatch_log_subscription_filter" "firehose" {
  name            = replace(aws_cloudwatch_log_group.lambda.name, "/", "-")
  log_group_name  = aws_cloudwatch_log_group.lambda.name
  filter_pattern  = var.filter_pattern
  destination_arn = var.destination_arn
  role_arn        = var.subscription_role_arn
}
