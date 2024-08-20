resource "aws_amplify_branch" "main" {
  app_id                      = var.amplify_app_id
  branch_name                 = var.branch
  display_name                = var.name
  enable_pull_request_preview = false
  enable_auto_build           = var.enable_auto_deploy

  environment_variables = {
    USER_POOL_CLIENT_ID   = var.cognito_user_pool_client_id
    NOTIFY_SUBDOMAIN      = var.subdomain
    NEXT_PUBLIC_BASE_PATH = var.base_path
  }
}
