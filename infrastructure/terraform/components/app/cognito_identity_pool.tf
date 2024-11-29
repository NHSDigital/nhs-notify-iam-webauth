resource "aws_cognito_identity_pool" "main" {
  identity_pool_name               = local.csi
  allow_unauthenticated_identities = false

  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.main.id
    provider_name           = aws_cognito_user_pool.main.endpoint
    server_side_token_check = false
  }
}

resource "aws_cognito_identity_pool_roles_attachment" "main" {
  identity_pool_id = aws_cognito_identity_pool.main.id

  role_mapping {
    identity_provider         = "${aws_cognito_user_pool.main.endpoint}:${aws_cognito_user_pool_client.main.id}"
    ambiguous_role_resolution = "AuthenticatedRole"
    type                      = "Token"
  }

  roles = {
    "authenticated"   = aws_iam_role.identity_pool_authenticated_role.arn
    "unauthenticated" = aws_iam_role.identity_pool_unauthenticated_role.arn
  }
}

resource "aws_iam_role" "identity_pool_authenticated_role" {
  name               = "${local.csi}-identity-pool-authenticated"
  assume_role_policy = data.aws_iam_policy_document.identity_pool_authenticated_assume_role_policy.json
}

resource "aws_iam_role_policy" "identity_pool_authenticated_role" {
  name   = "authenticated_policy"
  role   = aws_iam_role.identity_pool_authenticated_role.id
  policy = data.aws_iam_policy_document.identity_pool_role_policy.json
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

resource "aws_iam_role" "identity_pool_unauthenticated_role" {
  name               = "${local.csi}-identity-pool-unauthenticated"
  assume_role_policy = data.aws_iam_policy_document.identity_pool_unauthenticated_assume_role_policy.json
}

resource "aws_iam_role_policy" "identity_pool_unauthenticated_role" {
  name   = "authenticated_policy"
  role   = aws_iam_role.identity_pool_unauthenticated_role.id
  policy = data.aws_iam_policy_document.identity_pool_role_policy.json
}

data "aws_iam_policy_document" "identity_pool_unauthenticated_assume_role_policy" {
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
      values   = ["unauthenticated"]
    }
  }
}

data "aws_iam_policy_document" "identity_pool_role_policy" {
  statement {
    effect = "Allow"

    actions = [
      "cognito-identity:GetCredentialsForIdentity"
    ]

    resources = ["*"]
  }
}
