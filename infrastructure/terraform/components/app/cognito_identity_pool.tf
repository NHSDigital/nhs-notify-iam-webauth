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
    identity_provider         = aws_cognito_user_pool.main.endpoint
    ambiguous_role_resolution = "AuthenticatedRole"
    type                      = "Token"
  }

  roles = {
    "authenticated" = aws_iam_role.authenticated.arn
  }
}

resource "aws_iam_role" "authenticated" {
  name               = "${local.csi}-cognito-identity"
  assume_role_policy = data.aws_iam_policy_document.authenticated.json
}

data "aws_iam_policy_document" "authenticated" {
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


data "aws_iam_policy_document" "authenticated_role_policy" {
  statement {
    effect = "Allow"

    actions = [
      "cognito-identity:GetCredentialsForIdentity"
    ]

    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "authenticated" {
  name   = "authenticated_policy"
  role   = aws_iam_role.authenticated.id
  policy = data.aws_iam_policy_document.authenticated_role_policy.json
}