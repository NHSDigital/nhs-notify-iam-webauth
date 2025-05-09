module "obs_datasource" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/obs-datasource?ref=v2.0.3"

  name = "obs-datasource"

  aws_account_id = var.aws_account_id
  region         = var.region
  project        = var.project
  environment    = var.environment
  component      = var.component

  oam_sink_id               = var.oam_sink_id
  observability_account_id  = var.observability_account_id
}
