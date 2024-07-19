resource "aws_cloudwatch_log_group" "amplify" {
  name              = "/aws/amplify/${local.csi}"
  retention_in_days = var.log_retention_in_days
  kms_key_id        = module.kms.key_arn
}
