resource "aws_ssm_parameter" "amplify_password" {
  count = var.enable_amplify_basic_auth ? 1 : 0

  name        = "/${local.csi}/amplify_password"
  description = "The Basic Auth password used for the amplify app. This parameter is sourced from Github Environment variables"

  type  = "String"
  value = var.AMPLIFY_BASIC_AUTH_SECRET != "unset" ? var.AMPLIFY_BASIC_AUTH_SECRET : random_password.password[0].result
}

resource "random_password" "password" {
  count = var.enable_amplify_basic_auth && var.AMPLIFY_BASIC_AUTH_SECRET == "unset" ? 1 : 0

  length  = 16
  special = true
}
