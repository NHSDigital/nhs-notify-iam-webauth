data "aws_iam_policy_document" "identity_pool_role_policy" {
  statement {
    effect = "Allow"

    actions = [
      "cognito-identity:GetCredentialsForIdentity"
    ]

    resources = ["*"]
  }
}
