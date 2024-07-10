module "amplify_branch" {
  source      = "../../modules/amplify-branch"
  domain      = var.domain
  environment = var.environment
  component   = var.component
  group       = var.group

  cognito_user_pool_id                      = local.user_pool_id
  cognito_user_pool_identity_provider_names = local.identity_provider_names
  amplify_app_id                            = local.app_id
  branch                                    = "abcd01/CCM-1500-test" #var.branch # TODO get branch name from dynamic env setup
  subdomain                                 = var.environment
  domain_name                               = local.app_domain_name
}
