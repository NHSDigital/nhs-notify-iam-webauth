output "pre_token_generation_lambda_function_arn" {
  value = module.pre_token_generation_lambda.function_arn
}

output "client_config_parameter_path_prefix" {
  value = local.client_config_parameter_path_prefix
}
