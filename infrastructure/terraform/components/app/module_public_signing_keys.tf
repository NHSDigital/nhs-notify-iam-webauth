module "public_signing_keys" {
  source         = "../../modules/public-signing-keys"
  providers = {
    aws = aws
    aws = aws.us-east-1
  }

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region

  dns_zone_id              = local.acct.dns_zone["id"]
  s3_access_logs_bucket_id = local.acct.s3_buckets["access_logs"]["id"]
}
