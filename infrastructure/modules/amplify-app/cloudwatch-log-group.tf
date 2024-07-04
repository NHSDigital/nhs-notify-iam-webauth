resource "aws_cloudwatch_log_group" "app" {
  name = "/aws/amplify/${aws_amplify_app.app.id}"

  retention_in_days = 30
}
