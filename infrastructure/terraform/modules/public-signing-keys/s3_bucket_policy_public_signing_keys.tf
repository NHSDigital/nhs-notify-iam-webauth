resource "aws_s3_bucket_policy" "public_signing_keys" {
  bucket = module.s3bucket_public_signing_keys.id
  policy = data.aws_iam_policy_document.bucket_policy_public_signing_keys.json
}

data "aws_iam_policy_document" "bucket_policy_public_signing_keys" {
  statement {
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
    for_each = aws_cloudfront_origin_access_identity.signing_keys
    content {
      actions = ["s3:GetObject", "s3:ListBucket"]
      resources = [
        module.s3bucket_public_signing_keys.arn,
        "${module.s3bucket_public_signing_keys.arn}/*"
      ]

      principals {
        type        = "AWS"
        identifiers = [statement.value["iam_arn"]]
      }
    }
  }

  statement {
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
