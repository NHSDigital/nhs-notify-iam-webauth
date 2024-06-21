module "userpool" {
  source      = "../../modules/userpool"
  domain      = var.domain
  environment = var.environment
  component   = var.component
  stage       = var.stage

  app_url = "https://${local.app_domain_name}"
}
