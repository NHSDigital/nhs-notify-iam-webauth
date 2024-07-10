module "userpool" {
  source      = "../../modules/userpool"
  domain      = var.domain
  environment = var.environment
  component   = var.component
  group       = var.group

  app_url = "https://${local.app_domain_name}"
}
