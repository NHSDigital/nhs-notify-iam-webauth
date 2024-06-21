module "route53-zone" {
  source      = "../../modules/route53-zone"
  domain      = var.domain
  environment = var.environment
  component   = var.component
  stage       = var.stage
}
