data "aws_cognito_user_pool_client" "client" {
  client_id    = local.app.cognito_user_pool_client["id"]
  user_pool_id = local.app.cognito_user_pool["id"]
}

module "amplify_branch" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/amp_branch?ref=v1.0.0"

  name         = local.normalised_branch_name
  display_name = local.normalised_branch_name
  description  = "Amplify branch for ${local.normalised_branch_name}"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region
  group          = var.group

  amplify_app_id    = local.app.amplify["id"]
  branch            = var.branch_name
  enable_auto_build = true

  environment_variables = {
    NEXT_PUBLIC_BASE_PATH           = "/auth~${local.normalised_branch_name}"
    NEXT_PUBLIC_USER_POOL_ID        = local.app.cognito_user_pool["id"]
    NEXT_PUBLIC_USER_POOL_CLIENT_ID = data.aws_cognito_user_pool_client.client.id
    USER_POOL_CLIENT_SECRET         = data.aws_cognito_user_pool_client.client.client_secret
    NEXT_PUBLIC_COGNITO_DOMAIN      = local.app.cognito_user_pool["domain"]
    NEXT_PUBLIC_REDIRECT_DOMAIN     = local.app.amplify["auth_gateway_name"]
  }
}
