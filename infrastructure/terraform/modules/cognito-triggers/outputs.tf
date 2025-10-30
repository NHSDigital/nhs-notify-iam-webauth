output "pre_token_generation_lambda_function_arn" {
  value = module.pre_token_generation_lambda.function_arn
}

output "pre_authentication_lambda_function_arn" {
  value = module.pre_authentication_lambda.function_arn
}

output "pre_sign_up_lambda_function_arn" {
  value = module.pre_sign_up_lambda.function_arn
}

output "client_config_parameter_path_prefix" {
  value = local.client_config_parameter_path_prefix
}

output "users_table_name" {
  value = aws_dynamodb_table.users.name
}
