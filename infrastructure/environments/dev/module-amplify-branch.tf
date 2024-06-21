module "amplify_branch" {
  source      = "../../modules/amplify-branch"
  domain      = var.domain
  environment = var.environment
  component   = var.component
  stage       = var.stage

  cognito_user_pool_id                      = module.userpool.user_pool_id
  cognito_user_pool_identity_provider_names = module.userpool.identity_provider_names
  amplify_app_id                            = module.amplify_app.app_id
  branch                                    = var.branch
  domain_name                               = local.app_domain_name
  subdomain                                 = var.environment
}
