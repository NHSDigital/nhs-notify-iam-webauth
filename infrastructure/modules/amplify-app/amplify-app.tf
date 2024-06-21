resource "aws_amplify_app" "app" {
  name = "${local.csi}"

  iam_service_role_arn = aws_iam_role.service_role.arn

  repository = var.repository
  access_token = var.github_pat

  # Only enable automation for dev environment
  # TODO If we want to enable branch creation we need to move the setup in modules/amplify-branch to the CDK setup
  enable_auto_branch_creation = false #var.environment == "dev"
  enable_branch_auto_build    = var.environment == "dev"
  auto_branch_creation_patterns = [
    "*",
    "*/**"
  ]

  platform = "WEB_COMPUTE"

  environment_variables = {
    USER_POOL_ID        = var.cognito_user_pool_id
    HOSTED_LOGIN_DOMAIN = var.cognito_hosted_login_domain
    NOTIFY_STAGE        = var.stage
    NOTIFY_ENVIRONMENT  = var.environment
    NOTIFY_DOMAIN_NAME  = var.domain_name
  }

  tags = local.deployment_default_tags
}
