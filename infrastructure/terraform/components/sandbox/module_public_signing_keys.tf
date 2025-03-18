module "public_signing_keys" {
  source         = "../../modules/public-signing-keys"
  aws_account_id = var.aws_account_id
  environment    = var.environment
  region         = var.region
  project        = var.project
  csi            = local.csi
  acct           = local.acct
}
