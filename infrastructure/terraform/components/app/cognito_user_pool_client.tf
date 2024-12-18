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
}
