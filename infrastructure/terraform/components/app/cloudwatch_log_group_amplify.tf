resource "aws_cloudwatch_log_group" "amplify" {
  name              = "/aws/amplify/${aws_amplify_app.main.id}"
  retention_in_days = var.log_retention_in_days
}

resource "aws_cloudwatch_log_subscription_filter" "amplify" {
  name            = "${local.csi}-amplify-${aws_amplify_app.main.id}"
  log_group_name  = aws_cloudwatch_log_group.amplify.name
  filter_pattern  = ""
  destination_arn = local.log_destination_arn
  role_arn        = local.acct.log_subscription_role_arn

  depends_on = [aws_amplify_app.main]
}
