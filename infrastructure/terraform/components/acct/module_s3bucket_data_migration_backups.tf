module "s3bucket_data_migration_backups" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.24/terraform-s3bucket.zip"

  name = "migration-backup"

  aws_account_id = var.aws_account_id
  region         = var.region
  project        = var.project
  environment    = var.environment
  component      = var.component

  acl           = "private"
  force_destroy = false
  versioning    = true

  lifecycle_rules = [
    {
      enabled = true

      expiration = {
        days = 90
      }

      noncurrent_version_expiration = {
        noncurrent_days = 14
      }
    }
  ]

  policy_documents = [
    data.aws_iam_policy_document.s3bucket_data_migration_backups.json
  ]

  bucket_logging_target = {
    bucket = module.s3bucket_access_logs.id
  }

  public_access = {
    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
  }


  default_tags = {
    Name = "Data migration backups"
  }
}

data "aws_iam_policy_document" "s3bucket_data_migration_backups" {
  statement {
    sid    = "DontAllowNonSecureConnection"
    effect = "Deny"

    actions = [
      "s3:*",
    ]

    resources = [
      module.s3bucket_data_migration_backups.arn,
      "${module.s3bucket_data_migration_backups.arn}/*",
    ]

    principals {
      type = "AWS"

      identifiers = [
        "*",
      ]
    }

    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"

      values = [
        "false",
      ]
    }
  }

  statement {
    sid    = "AllowManagedAccountFullAccess"
    effect = "Allow"

    actions = [
      "s3:ListBucket",
      "s3:GetObject",
      "s3:PutObject"
    ]

    resources = [
      "${module.s3bucket_data_migration_backups.arn}",
      "${module.s3bucket_data_migration_backups.arn}/*",
    ]

    principals {
      type = "AWS"
      identifiers = [
        "arn:aws:iam::${var.aws_account_id}:root"
      ]
    }
  }
}
