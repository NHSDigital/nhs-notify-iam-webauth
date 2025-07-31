resource "aws_ssm_parameter" "cis2_client_credentials_client_id" {
  name  = "/${local.csi}/federation/credentials/client-id/cis2-${var.cis2_environment}"
  type  = "SecureString"
  value = "placeholder"

  lifecycle {
    ignore_changes = [value]
  }
}
