resource "aws_cognito_user_pool" "main" {
  name = local.csi

  username_attributes = ["email"]

  admin_create_user_config {
    allow_admin_create_user_only = true
  }
}
