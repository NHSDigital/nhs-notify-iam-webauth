module "s3bucket_access_logs_us" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/3.0.4/terraform-s3bucket.zip"

  name = "access-logs"

  providers = {
    aws = aws.us-east-1
  }

  aws_account_id = var.aws_account_id
  region         = "us-east-1"
  project        = var.project
  environment    = var.environment
  component      = var.component

  acl           = "private"
  force_destroy = false
  versioning    = true

  lifecycle_rules = [
    {
      enabled = true

      noncurrent_version_transition = [
        {
          noncurrent_days = "30"
          storage_class   = "STANDARD_IA"
        }
      ]

      noncurrent_version_expiration = {
        noncurrent_days = "90"
      }

      abort_incomplete_multipart_upload = {
        days = "1"
      }
    }
  ]

  policy_documents = [
    data.aws_iam_policy_document.s3bucket_access_logs_us.json
  ]

  public_access = {
    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
  }

  default_tags = {
    Name = "S3 bucket access logs"
  }
}

data "aws_iam_policy_document" "s3bucket_access_logs_us" {
  statement {
    sid    = "DontAllowNonSecureConnection"
    effect = "Deny"

    actions = [
      "s3:*",
    ]

    resources = [
      module.s3bucket_access_logs_us.arn,
      "${module.s3bucket_access_logs_us.arn}/*",
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
    sid    = "AllowManagedAccountsToList"
    effect = "Allow"

    actions = [
      "s3:ListBucket",
    ]

    resources = [
      module.s3bucket_access_logs_us.arn,
    ]

    principals {
      type = "AWS"
      identifiers = [
        "arn:aws:iam::${var.aws_account_id}:root"
      ]
    }
  }

  statement {
    sid    = "AllowManagedAccountsToGet"
    effect = "Allow"

    actions = [
      "s3:GetObject",
    ]

    resources = [
      "${module.s3bucket_access_logs_us.arn}/*",
    ]

    principals {
      type = "AWS"
      identifiers = [
        "arn:aws:iam::${var.aws_account_id}:root"
      ]
    }
  }

  statement {
    sid    = "AllowS3AccessLogging"
    effect = "Allow"

    actions = [
      "s3:PutObject",
    ]

    resources = [
      "${module.s3bucket_access_logs_us.arn}/*",
    ]

    principals {
      type = "Service"

      identifiers = [
        "logging.s3.amazonaws.com",
      ]
    }
  }
}
