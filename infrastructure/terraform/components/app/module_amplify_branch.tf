module "amplify_branch" {
  source            = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/amp_branch?ref=v1.0.0"
  name              = "main"
  display_name      = "main"
  aws_account_id    = var.aws_account_id
  component         = var.component
  environment       = var.environment
  project           = var.project
  region            = var.region
  group             = var.group
  description       = "Amplify branch for main"
  amplify_app_id    = aws_amplify_app.main.id
  branch            = var.branch_name
  stage             = "PRODUCTION"
  enable_auto_build = true
  environment_variables = {
    USER_POOL_ID          = aws_cognito_user_pool.main.id
    USER_POOL_CLIENT_ID   = aws_cognito_user_pool_client.main.id
    NOTIFY_SUBDOMAIN      = var.environment
    NEXT_PUBLIC_BASE_PATH = "/auth"
  }
}
