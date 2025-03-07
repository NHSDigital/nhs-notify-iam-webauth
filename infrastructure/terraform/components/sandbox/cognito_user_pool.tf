resource "aws_cognito_user_pool" "main" {
  name = local.csi

  username_attributes = ["email"]

  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "admin_only"
      priority = 1
    }
  }

  lambda_config {
    post_authentication = module.cognito_triggers.post_authentication_lambda_function_arn
  }
}
