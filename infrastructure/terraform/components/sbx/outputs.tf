output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "cognito_user_pool_client_id" {
  value = aws_cognito_user_pool_client.main.id
}

output "cognito_domain" {
  value = "${aws_cognito_user_pool_domain.main.domain}.auth.eu-west-2.amazoncognito.com"
}

output "redirect_domain" {
  value = "http://localhost:3000/auth/oauth2"
}

output "signout_redirect_domain" {
  value = "http://localhost:3000/auth"
}

output "cis2_provider_name" {
  value = "CIS2-int"
}

output "deployment" {
  description = "Deployment details used for post-deployment scripts"
  value = {
    aws_region     = var.region
    aws_account_id = var.aws_account_id
    project        = var.project
    environment    = var.environment
    group          = var.group
    component      = var.component
  }
}

output "csrf_secret" {
  value = random_bytes.csrf_secret.hex

  sensitive = true
}

output "name_tag" {
  value = local.default_tags["Name"]
}

output "group_tag" {
  value = local.default_tags["Group"]
}

output "key_directory_ssm_parameter_name" {
  value = module.public_signing_keys.key_directory_ssm_parameter_name
}

output "key_rotation_lambda_name" {
  value = module.public_signing_keys.key_rotation_lambda_name
}

output "public_keys_s3_bucket_name" {
  value = module.public_signing_keys.public_keys_s3_bucket_name
}

output "kms_key_id" {
  description = "KMS Key Id used to encrypt application data"
  value       = local.acct.sandbox_kms_key.id
}

output "client_config_parameter_path_prefix" {
  value = module.cognito_triggers.client_config_parameter_path_prefix
}

output "users_table_name" {
  value = module.cognito_triggers.users_table_name
}
