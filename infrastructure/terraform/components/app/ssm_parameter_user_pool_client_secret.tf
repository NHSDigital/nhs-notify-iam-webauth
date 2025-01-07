resource "aws_ssm_parameter" "user_pool_client_secret" {
  name  = "/amplify/shared/${aws_amplify_app.main.id}/USER_POOL_CLIENT_SECRET"
  type  = "SecureString"
  value = aws_cognito_user_pool_client.main.client_secret
}
