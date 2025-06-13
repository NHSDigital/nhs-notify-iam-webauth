module "nhse_backup_vault" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/aws-backup-source?ref=v2.0.12"
  count  = var.destination_vault_arn != null ? 1 : 0

  component   = var.component
  environment = var.environment
  project     = var.project

  backup_copy_vault_account_id = data.aws_arn.destination_vault_arn[0].account
  backup_copy_vault_arn        = data.aws_arn.destination_vault_arn[0].arn

  reports_bucket                     = local.acct.s3_buckets["backup_reports"]["bucket"]
  notifications_target_email_address = var.backup_report_recipient
  notification_kms_key               = module.kms.key_id

  management_ci_role_arn = local.bootstrap.iam_github_deploy_role["arn"]
  principal_org_id       = var.aws_principal_org_id

  restore_testing_plan_scheduled_expression = "cron(0 4 ? * wed *)"
  restore_testing_plan_start_window         = 1

  backup_plan_config_s3 = {
    "compliance_resource_types" : [
      "S3"
    ],
    "rules" : [
      {
        "name" : "${local.csi}-backup-rule",
        "schedule" : var.backup_schedule_cron,
        "copy_action" : {
          "delete_after" : var.retention_period
        },
        "lifecycle" : {
          "delete_after" : var.retention_period
        }
      }
    ],
    "enable" : true,
    "selection_tag" : "NHSE-Enable-S3-Backup"
  }
}

data "aws_arn" "destination_vault_arn" {
  count = var.destination_vault_arn != null ? 1 : 0

  arn = var.destination_vault_arn
}
