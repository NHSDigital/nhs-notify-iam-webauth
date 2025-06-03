resource "aws_iam_policy" "public_signing_keys" {
  name        = "${local.csi}-public-signing-keys"
  description = "Access policy to allow access to public signing keys in S3"
  path        = "/"
  policy      = data.aws_iam_policy_document.public_signing_keys.json
}

#trivy:ignore:aws-iam-no-policy-wildcards Actions resticted to appropriate targets
data "aws_iam_policy_document" "public_signing_keys" {
  statement {
    sid    = "AllowS3Read"
    effect = "Allow"

    actions = [
      "s3:List*",
      "s3:Get*",
    ]

    resources = [
      module.s3bucket_public_signing_keys.arn,
      "${module.s3bucket_public_signing_keys.arn}/*",
    ]
  }
}
