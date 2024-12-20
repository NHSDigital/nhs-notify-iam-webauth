resource "aws_ssm_parameter" "amplify_password" {
  count = var.enable_amplify_basic_auth ? 1 : 0

  name        = "/${local.csi}/amplify_password"
  description = "The Basic Auth password used for the amplify app. This parameter is sourced from Github Environment variables"

  type  = "String"
  value = var.amplify_basic_auth_secret != "unset" ? var.amplify_basic_auth_secret : random_password.password[0].result
}

resource "random_password" "password" {
  count = var.enable_amplify_basic_auth && var.amplify_basic_auth_secret == "unset" ? 1 : 0

  length  = 16
  special = true
}
