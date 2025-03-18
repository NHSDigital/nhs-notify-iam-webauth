resource "aws_s3_bucket_policy" "public_signing_keys" {
  bucket = module.s3bucket_public_signing_keys.id
  policy = data.aws_iam_policy_document.bucket_policy_public_signing_keys.json
}

data "aws_iam_policy_document" "bucket_policy_public_signing_keys" {
  statement {
    actions = ["s3:GetObject"]
    resources = [
      "${module.s3bucket_public_signing_keys.arn}/*"
    ]

    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${var.aws_account_id}:root", aws_cloudfront_origin_access_identity.signing_keys.iam_arn]
    }
  }

  statement {
    actions = ["s3:ListBucket"]
    resources = [
      module.s3bucket_public_signing_keys.arn
    ]

    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${var.aws_account_id}:root", aws_cloudfront_origin_access_identity.signing_keys.iam_arn]
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
