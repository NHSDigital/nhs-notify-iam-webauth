resource "aws_cognito_user_pool_client" "main" {
  depends_on = [aws_cognito_identity_provider.cis2_idp]

  name         = local.csi
  user_pool_id = aws_cognito_user_pool.main.id

  callback_urls = flatten([
    var.cognito_user_pool_additional_callback_urls,
    [
      "https://${var.environment}.${local.acct.dns_zone["name"]}/auth/oauth2",
      "https://${aws_amplify_app.main.default_domain}/auth/oauth2"
    ],
    var.cognito_user_pool_use_environment_specific_gateway_callback_url ? [
      "https://${var.environment}.${var.cognito_user_pool_environment_specific_gateway_callback_url_suffix}"
    ] : []
  ])

  logout_urls = flatten([
    var.cognito_user_pool_additional_logout_urls,
    [
      "https://${var.environment}.${local.acct.dns_zone["name"]}/auth",
      "https://${aws_amplify_app.main.default_domain}/auth"
    ],
    var.cognito_user_pool_use_environment_specific_gateway_callback_url ? [
      "https://${var.environment}.${var.cognito_user_pool_environment_specific_gateway_logout_url_suffix}"
    ] : []
  ])

  supported_identity_providers = flatten(
    concat(local.cognito_idp, local.cis2_idp)
  )

  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes = [
    "openid",
    "email",
    "profile",
    "aws.cognito.signin.user.admin"
  ]
  generate_secret = false

  access_token_validity  = 1
  id_token_validity      = 1
  refresh_token_validity = 12

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "hours"
  }
}
