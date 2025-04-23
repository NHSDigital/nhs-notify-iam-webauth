resource "aws_ssm_parameter" "key_directory" {
  name        = local.ssm_key_directory_name
  description = "An array of KMS signing keys in rotation used for CIS2 authentication"
  type        = "String"
  value       = "[]"

  lifecycle {
    ignore_changes = [value]
  }
}
