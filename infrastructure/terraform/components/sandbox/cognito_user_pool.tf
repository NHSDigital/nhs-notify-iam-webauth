resource "aws_cognito_user_pool" "main" {
  name = local.csi

  username_attributes = ["email"]

  user_pool_tier = "ESSENTIALS"

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
    pre_token_generation_config {
      lambda_arn     = module.cognito_triggers.pre_token_generation_lambda_function_arn
      lambda_version = "V2_0"
    }

    pre_authentication = module.cognito_triggers.pre_authentication_lambda_function_arn

    post_confirmation = module.cognito_triggers.post_confirmation_lambda_function_arn
  }
}
