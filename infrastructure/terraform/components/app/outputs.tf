output "cognito_user_pool" {
  value = {
    id                 = aws_cognito_user_pool.main.id
    identity_providers = aws_cognito_user_pool_client.main.supported_identity_providers
  }
}

output "cognito_user_pool_client" {
  value = {
    id = aws_cognito_user_pool_client.main.id
  }
}

output "amplify" {
  value = {
    id          = aws_amplify_app.main.id
    domain_name = local.root_domain_name
  }
}
