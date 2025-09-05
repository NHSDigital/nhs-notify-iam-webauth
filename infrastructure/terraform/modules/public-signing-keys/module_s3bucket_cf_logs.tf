module "s3bucket_cf_logs" {
  count  = var.deploy_cdn ? 1 : 0
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-s3bucket.zip"
  providers = {
    aws = aws.us-east-1
  }

  name = "cf-logs"

  aws_account_id = var.aws_account_id
  region         = "us-east-1"
  project        = var.project
  environment    = var.environment
  component      = var.component

  acl        = "private"
  versioning = true

  object_ownership = "ObjectWriter"

  lifecycle_rules = [
    {
      prefix  = ""
      enabled = true

      transition = [
        {
          days          = "90"
          storage_class = "STANDARD_IA"
        },
        {
          days          = "180"
          storage_class = "GLACIER"
        }
      ]

      expiration = {
        days = "365"
      }


      noncurrent_version_transition = [
        {
          noncurrent_days = "30"
          storage_class   = "STANDARD_IA"
        },
        {
          noncurrent_days = "180"
          storage_class   = "GLACIER"
        }

      ]

      noncurrent_version_expiration = {
        noncurrent_days = "365"
      }

      abort_incomplete_multipart_upload = {
        days = "1"
      }
    }
  ]

  policy_documents = [
    data.aws_iam_policy_document.s3bucket_cf_logs[0].json
  ]

  public_access = {
    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
  }

  default_tags = {
    Name = "Cloudfront Logs"
  }
}

data "aws_iam_policy_document" "s3bucket_cf_logs" {
  count = var.deploy_cdn ? 1 : 0
  statement {
    sid    = "DontAllowNonSecureConnection"
    effect = "Deny"

    actions = [
      "s3:*",
    ]

    resources = [
      module.s3bucket_cf_logs[0].arn,
      "${module.s3bucket_cf_logs[0].arn}/*",
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
    effect  = "Allow"
    actions = ["s3:PutObject"]
    resources = [
      "${module.s3bucket_cf_logs[0].arn}/*",
    ]

    principals {
      type        = "Service"
      identifiers = ["logging.s3.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values = [
        var.aws_account_id
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
      module.s3bucket_cf_logs[0].arn,
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
      "${module.s3bucket_cf_logs[0].arn}/*",
    ]

    principals {
      type = "AWS"
      identifiers = [
        "arn:aws:iam::${var.aws_account_id}:root"
      ]
    }
  }
}
