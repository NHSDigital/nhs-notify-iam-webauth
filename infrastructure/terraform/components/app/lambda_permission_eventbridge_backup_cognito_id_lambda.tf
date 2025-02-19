resource "aws_lambda_permission" "eventbridge_backup_cognito_id_lambda" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda_backup_cognito_id.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.backup_cognito_id.arn
}
