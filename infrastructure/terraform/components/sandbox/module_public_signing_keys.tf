module "public_signing_keys" {
  source = "../../modules/public-signing-keys"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region

  dns_zone_name            = local.acct.dns_zone["name"]
  s3_access_logs_bucket_id = local.acct.s3_buckets["access_logs"]["id"]
}
