resource "aws_ssm_parameter" "tests" {
  name        = "/${local.csi}/tests"
  description = "Test SSM Parameter for testing"
  type        = "SecureString"
  value       = "Test"
}
