module "amplify_app" {
  source      = "../../modules/amplify-app"
  domain      = var.domain
  environment = var.environment
  component   = var.component
  group       = var.group

  cognito_user_pool_id        = module.userpool.user_pool_id
  cognito_hosted_login_domain = module.userpool.hosted_login_domain
  domain_name                 = local.app_domain_name

  repository = var.repository
  github_pat = var.github_pat
}
