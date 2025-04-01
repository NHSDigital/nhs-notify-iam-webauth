resource "aws_ssm_parameter" "test" {
  name        = "/${local.csi}/test"
  description = "Test SSM Parameter for testing"
  type        = "SecureString"
  value       = "Test"
}
