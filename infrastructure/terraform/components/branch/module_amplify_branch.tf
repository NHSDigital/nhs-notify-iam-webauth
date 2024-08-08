module "amplify_branch" {
  source = "../../modules/amp_branch"

  name           = lower(substr(join("", regexall("[a-zA-Z0-9-]+", var.branch_name)), 0, 25))
  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region
  group          = var.group

  cognito_user_pool_client_id               = local.iam.cognito_user_pool_client["id"]
  cognito_user_pool_identity_provider_names = local.iam.cognito_user_pool["identity_providers"]
  amplify_app_id                            = local.iam.amplify["id"]
  branch                                    = var.branch_name
  domain_name                               = local.root_domain_name
  subdomain                                 = var.environment
}
