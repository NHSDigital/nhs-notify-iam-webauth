output "key_directory_ssm_parameter_name" {
  value = local.ssm_key_directory_name
}

output "key_rotation_lambda_name" {
  value = module.lambda_jwks_key_rotation.function_name
}

output "public_keys_s3_bucket_name" {
  value = module.s3bucket_public_signing_keys.bucket
}
