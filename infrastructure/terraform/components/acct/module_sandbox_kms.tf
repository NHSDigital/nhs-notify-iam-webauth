module "kms_sandbox" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/kms?ref=v1.0.8"

  count = var.support_sandbox_environments ? 1 : 0

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region

  name            = "sandbox"
  deletion_window = var.kms_deletion_window
  alias           = "alias/${local.csi}-sandbox"
  iam_delegation  = true
}

