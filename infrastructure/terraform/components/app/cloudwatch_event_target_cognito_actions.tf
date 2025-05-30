resource "aws_cloudwatch_event_target" "cognito_actions" {
  count = var.destination_vault_arn != null ? 1 : 0

  rule = aws_cloudwatch_event_rule.backup_cognito_id[0].name
  arn  = module.lambda_backup_cognito_id[0].function_arn
}
