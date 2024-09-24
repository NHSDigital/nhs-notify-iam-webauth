resource "aws_cloudwatch_log_group" "amplify" {
  name              = "/aws/amplify/${aws_amplify_app.main.id}"
  retention_in_days = var.log_retention_in_days
}
