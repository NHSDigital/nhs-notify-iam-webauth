output "user_pool_id" {
  value = aws_cognito_user_pool.userpool.id
}

output "identity_provider_names" {
  value = [aws_cognito_identity_provider.auth0.provider_name]
}

output "hosted_login_domain" {
  # TODO does not need suffix after switching to custom FQDN
  value = "${ aws_cognito_user_pool_domain.domain.domain }.auth.eu-west-2.amazoncognito.com"
}
