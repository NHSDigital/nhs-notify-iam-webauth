module "amplify_branch" {
  source            = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/amp_branch?ref=v1.0.0"
  name              = var.branch_name
  display_name      = var.url_prefix
  aws_account_id    = var.aws_account_id
  component         = var.component
  environment       = var.environment
  project           = var.project
  region            = var.region
  group             = var.group
  description       = "Amplify branch for production branch (${var.branch_name})"
  amplify_app_id    = aws_amplify_app.main.id
  branch            = var.branch_name
  stage             = "PRODUCTION"
  enable_auto_build = false
  environment_variables = {
    NOTIFY_SUBDOMAIN                = var.environment
    NEXT_PUBLIC_BASE_PATH           = "/auth"
    AMPLIFY_APP_ID                  = aws_amplify_app.main.id
    NEXT_PUBLIC_USER_POOL_ID        = aws_cognito_user_pool.main.id
    NEXT_PUBLIC_USER_POOL_CLIENT_ID = aws_cognito_user_pool_client.main.id
    NEXT_PUBLIC_COGNITO_DOMAIN      = local.use_custom_cognito_domain ? aws_cognito_user_pool_domain.custom[0].domain : aws_cognito_user_pool_domain.main.domain
    NEXT_PUBLIC_REDIRECT_DOMAIN     = local.auth_gateway_name
  }
}
