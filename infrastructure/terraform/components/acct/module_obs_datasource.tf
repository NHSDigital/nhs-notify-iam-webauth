module "obs_datasource" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-obs-datasource.zip"

  name = "obs-datasource"

  aws_account_id = var.aws_account_id
  region         = var.region
  project        = var.project
  environment    = var.environment
  component      = var.component

  oam_sink_id              = var.oam_sink_id
  observability_account_id = var.observability_account_id
}
