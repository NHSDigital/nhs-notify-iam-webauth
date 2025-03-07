resource "aws_iam_role" "identity_pool_authenticated_role" {
  name               = "${local.csi}-identity-pool-authenticated"
  assume_role_policy = data.aws_iam_policy_document.identity_pool_authenticated_assume_role_policy.json
}

resource "aws_iam_policy" "identity_pool_authenticated_policy" {
  name        = "${local.csi}-authenticated-policy"
  description = "Policy for authenticated users"
  policy      = data.aws_iam_policy_document.identity_pool_role_policy.json
}

resource "aws_iam_role_policy_attachment" "identity_pool_authenticated_role_attachment" {
  role       = aws_iam_role.identity_pool_authenticated_role.name
  policy_arn = aws_iam_policy.identity_pool_authenticated_policy.arn
}

data "aws_iam_policy_document" "identity_pool_authenticated_assume_role_policy" {
  statement {
    effect = "Allow"

    principals {
      type        = "Federated"
      identifiers = ["cognito-identity.amazonaws.com"]
    }

    actions = ["sts:AssumeRoleWithWebIdentity"]

    condition {
      test     = "StringEquals"
      variable = "cognito-identity.amazonaws.com:aud"
      values   = [aws_cognito_identity_pool.main.id]
    }

    condition {
      test     = "ForAnyValue:StringLike"
      variable = "cognito-identity.amazonaws.com:amr"
      values   = ["authenticated"]
    }
  }
}
