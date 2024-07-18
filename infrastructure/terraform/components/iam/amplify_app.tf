resource "aws_amplify_app" "main" {
  name = local.csi
  repository   = "https://github.com/NHSDigital/nhs-notify-iam-webauth"
  access_token = data.aws_ssm_parameter.github_pat_ssm_param_name.value

  iam_service_role_arn = aws_iam_role.amplify.arn

  enable_auto_branch_creation = false
  enable_branch_auto_build    = var.enable_amplify_branch_auto_build
  platform = "WEB_COMPUTE"

  auto_branch_creation_patterns = [
    "*",
    "*/**"
  ]

  environment_variables = {
    USER_POOL_ID        = aws_cognito_user_pool.main.id
    # HOSTED_LOGIN_DOMAIN = "auth.${var.environment}.${local.acct.dns_zone["name"]}"
    NOTIFY_GROUP        = var.group
    NOTIFY_ENVIRONMENT  = var.environment
    NOTIFY_DOMAIN_NAME  = local.acct.dns_zone["name"]
  }
}
