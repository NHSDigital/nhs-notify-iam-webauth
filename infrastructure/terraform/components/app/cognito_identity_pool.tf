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
