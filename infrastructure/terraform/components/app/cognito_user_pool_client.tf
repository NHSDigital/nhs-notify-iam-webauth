resource "aws_cognito_user_pool_client" "main" {
  name         = local.csi
  user_pool_id = aws_cognito_user_pool.main.id

  callback_urls = flatten([
    var.cognito_user_pool_additional_callback_urls,
    [
      "https://${var.environment}.${local.acct.dns_zone["name"]}/auth/",
      "https://${aws_amplify_app.main.default_domain}/auth/"
    ]
  ])

  supported_identity_providers = flatten([
    var.enable_cognito_built_in_idp ? ["COGNITO"] : [],
    # identity_provider_names.provider.provider_name   #e.g. auth0
  ])

  allowed_oauth_flows = ["code"]
  allowed_oauth_scopes = [
    "openid",
    "email",
    "phone",
    "profile",
    "aws.cognito.signin.user.admin"
  ]
}
