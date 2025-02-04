resource "aws_cognito_user_pool_client" "main" {
  name         = local.csi
  user_pool_id = aws_cognito_user_pool.main.id

  callback_urls = [
    "http://localhost:3000/auth"
  ]

  logout_urls = [
    "http://localhost:3000/auth"
  ]

  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes = [
    "openid",
    "email",
    "profile",
    "aws.cognito.signin.user.admin"
  ]

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]

  generate_secret = false

  access_token_validity  = 15
  id_token_validity      = 15
  refresh_token_validity = 1

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "hours"
  }

}
