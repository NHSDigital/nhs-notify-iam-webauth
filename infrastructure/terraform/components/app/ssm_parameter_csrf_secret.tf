resource "aws_ssm_parameter" "csrf_secret" {
  name        = "/${local.csi}/csrf_secret"
  description = "cryptographic secret used for CSRF token generation"

  type  = "SecureString"
  value = var.CSRF_SECRET
}
