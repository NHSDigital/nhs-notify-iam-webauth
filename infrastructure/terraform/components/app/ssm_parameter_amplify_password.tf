resource "aws_ssm_parameter" "amplify_password" {
  count = var.enable_amplify_basic_auth ? 1 : 0

  name  = "/${local.csi}/amplify_password"
  type  = "String"
  value = random_password.password[0].result
}

resource "random_password" "password" {
  count = var.enable_amplify_basic_auth ? 1 : 0

  length  = 16
  special = true
}
