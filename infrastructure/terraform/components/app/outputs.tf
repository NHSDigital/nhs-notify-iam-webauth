output "cognito_user_pool" {
  value = {
    id                 = aws_cognito_user_pool.main.id
    identity_providers = aws_cognito_user_pool_client.main.supported_identity_providers
    domain             = local.use_custom_cognito_domain ? aws_cognito_user_pool_domain.custom[0].domain : aws_cognito_user_pool_domain.main.domain
  }
}

output "cognito_domain" {
  value = {
    domain = local.use_custom_cognito_domain ? aws_cognito_user_pool_domain.custom[0].domain : aws_cognito_user_pool_domain.main.domain
  }
}

output "auth_gateway_name" {
  value = {
    name = local.auth_gateway_name
  }
}

output "cognito_user_pool_client" {
  value = {
    id = aws_cognito_user_pool_client.main.id
  }
}

output "amplify" {
  value = {
    id                = aws_amplify_app.main.id
    domain_name       = local.root_domain_name
    branch_name       = var.branch_name
    auth_gateway_name = local.auth_gateway_name
  }
}

output "deployment" {
  description = "Deployment details used for post-deployment scripts"
  value = {
    aws_region     = var.region
    aws_account_id = var.aws_account_id
    project        = var.project
    environment    = var.environment
    group          = var.group
    component      = var.component
    commit_id      = var.commit_id
  }
}
