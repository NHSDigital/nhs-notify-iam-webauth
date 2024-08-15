resource "aws_ssm_parameter" "test" {
  name        = "/${local.csi}/test"
  description = "test"
  type        = "SecureString"
  value       = "whateva"

  lifecycle {
    ignore_changes = [value]
  }
}