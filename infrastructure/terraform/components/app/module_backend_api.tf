module "backend_api" {
  source = "../../modules/backend-api"

  project               = var.project
  environment           = var.environment
  aws_account_id        = var.aws_account_id
  region                = var.region
  group                 = var.group
  csi                   = local.csi
  log_retention_in_days = var.log_retention_in_days

  cis2_url = local.cis2_issuer_urls[var.cis2_environment]
  destination_arn = "arn:aws:logs:${var.region}:${var.observability_account_id}:destination:nhs-notify-main-acct-firehose-logs"
  subscription_role_arn    = local.acct.log_subscription_role_arn
}
