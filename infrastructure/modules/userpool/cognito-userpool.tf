resource "aws_cognito_user_pool" "userpool" {
  name = local.csi

  username_attributes = ["email"]

  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  tags = local.deployment_default_tags
}

# TODO use a custom NHS domain
resource "aws_cognito_user_pool_domain" "domain" {
  user_pool_id = aws_cognito_user_pool.userpool.id
  domain       = "nhsnotify-${local.csi}"
}

resource "aws_cognito_identity_provider" "auth0" {
  user_pool_id  = aws_cognito_user_pool.userpool.id
  provider_name = "Auth0"
  provider_type = "OIDC"

  provider_details = {
    oidc_issuer                   = "https://dev-eaey683jozjppo41.uk.auth0.com"
    authorize_scopes              = "openid email phone profile"
    attributes_request_method     = "GET"
    client_id                     = "your client_id"
    client_secret                 = "your client_secret"
    attributes_url_add_attributes = false
  }

  attribute_mapping = {
    username              = "sub"
    email                 = "email"
    email_verified        = "email_verified"
    phone_number          = "phone_number"
    phone_number_verified = "phone_number_verified"
    profile               = "profile"
  }

  lifecycle {
    ignore_changes = [
      provider_details["client_id"],
      provider_details["client_secret"]
    ]
  }
}
