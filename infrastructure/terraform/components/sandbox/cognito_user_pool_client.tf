resource "aws_cognito_user_pool_client" "main" {
  name         = local.csi
  user_pool_id = aws_cognito_user_pool.main.id

  callback_urls = [
    "http://localhost:3000/auth/"
  ]

  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes = [
    "openid",
    "email",
    "profile",
    "aws.cognito.signin.user.admin"
  ]
}
