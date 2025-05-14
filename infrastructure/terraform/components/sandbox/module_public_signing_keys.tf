module "public_signing_keys" {
  source = "../../modules/public-signing-keys"
  providers = {
    aws           = aws
    aws.us-east-1 = aws.us-east-1
  }

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region
  group          = var.group
  kms_key_arn    = local.acct.kms_sandbox_arn
  default_tags   = local.default_tags

  dns_zone_id              = local.acct.dns_zone["id"]
  s3_access_logs_bucket_id = local.acct.s3_buckets["access_logs"]["id"]
  function_s3_bucket       = local.acct.s3_buckets["lambda_function_artefacts"]["id"]

  deploy_cdn                = false
  protect_public_key_bucket = false
}
