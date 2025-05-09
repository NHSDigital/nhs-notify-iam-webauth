data "aws_iam_policy_document" "bucket_policy_public_signing_keys" {
  statement {
    sid     = "AllowManagedAccountsToRead"
    actions = ["s3:GetObject", "s3:ListBucket"]
    resources = [
      module.s3bucket_public_signing_keys.arn,
      "${module.s3bucket_public_signing_keys.arn}/*"
    ]

    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${var.aws_account_id}:root"]
    }
  }

  dynamic "statement" {
    for_each = var.deploy_cdn ? [1] : []
    content {
      sid     = "AllowCDNAccess"
      actions = ["s3:GetObject", "s3:ListBucket"]
      resources = [
        module.s3bucket_public_signing_keys.arn,
        "${module.s3bucket_public_signing_keys.arn}/*"
      ]

      principals {
        type        = "AWS"
        identifiers = [aws_cloudfront_origin_access_identity.signing_keys[0].iam_arn]
      }
    }
  }

  statement {
    sid     = "DontAllowNonSecureConnection"
    effect  = "Deny"
    actions = ["s3:*"]
    resources = [
      module.s3bucket_public_signing_keys.arn,
      "${module.s3bucket_public_signing_keys.arn}/*",
    ]

    principals {
      type        = "AWS"
      identifiers = ["*"]
    }

    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values = [
        false
      ]
    }
  }
}
