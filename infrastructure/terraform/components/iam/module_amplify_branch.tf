module "amplify_branch" {
  source = "../../modules/amp_branch"

  name           = "main"
  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region
  group          = var.group

  cognito_user_pool_client_id               = aws_cognito_user_pool_client.main.id
  cognito_user_pool_identity_provider_names = aws_cognito_user_pool_client.main.supported_identity_providers
  amplify_app_id                            = aws_amplify_app.main.id
  branch                                    = "main"
  domain_name                               = local.root_domain_name
  subdomain                                 = var.environment
  enable_auto_deploy                        = true
}
