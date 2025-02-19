resource "aws_cloudwatch_event_target" "cognito_actions" {
  rule = aws_cloudwatch_event_rule.backup_cognito_id.name
  arn  = module.lambda_backup_cognito_id.function_arn
}
