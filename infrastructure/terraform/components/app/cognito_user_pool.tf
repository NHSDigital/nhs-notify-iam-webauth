resource "aws_cognito_user_pool" "main" {
  name = local.csi

  deletion_protection = var.cognito_prevent_deletion ? "ACTIVE" : "INACTIVE"

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

  schema {
    name                     = "idassurancelevel"
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    required                 = false
    string_attribute_constraints {
      min_length = 0
      max_length = 2048
    }
  }

  schema {
    name                     = "nhsid_user_orgs"
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    required                 = false
    string_attribute_constraints {
      min_length = 0
      max_length = 2048
    }
  }

  schema {
    name                     = "nhsid_useruid"
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    required                 = false
    string_attribute_constraints {
      min_length = 0
      max_length = 2048
    }
  }

  schema {
    name                     = "nhs_notify_user_id"
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    required                 = false
    string_attribute_constraints {
      min_length = 0
      max_length = 2048
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
