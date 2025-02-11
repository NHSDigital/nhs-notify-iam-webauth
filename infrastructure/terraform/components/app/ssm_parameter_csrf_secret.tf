resource "aws_ssm_parameter" "csrf_secret" {
  name        = "/${local.csi}/csrf_secret"
  description = "The Basic Auth password used for the amplify app. This parameter is sourced from Github Environment variables"

  type  = "String"
  value = var.CSRF_SECRET != "unset" ? var.CSRF_SECRET : random_bytes.csrf_secret[0].hex
}

resource "random_bytes" "csrf_secret" {
  count = var.CSRF_SECRET == "unset" ? 1 : 0

  length = 16
}
