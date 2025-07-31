resource "aws_cognito_identity_provider" "cis2_idp" {
  count = var.enable_cis2_idp ? 1 : 0

  user_pool_id  = aws_cognito_user_pool.main.id
  provider_name = local.cis2_idp_name
  provider_type = "OIDC"

  provider_details = {
    authorize_scopes          = "openid profile email nhsperson associatedorgs"
    client_id                 = aws_ssm_parameter.cis2_client_credentials_client_id.value
    oidc_issuer               = local.cis2_issuer_urls[var.cis2_environment]
    attributes_url            = "${local.cis2_issuer_urls[var.cis2_environment]}/userinfo"
    authorize_url             = "${module.backend_api.api_base_url}/v1/cis2-authorize"
    token_url                 = "${module.backend_api.api_base_url}/v1/cis2-token"
    jwks_uri                  = "${local.cis2_issuer_urls[var.cis2_environment]}/connect/jwk_uri"
    attributes_request_method = "GET"
  }

  attribute_mapping = {
    email                     = "email"
    username                  = "sub"
    given_name                = "given_name"
    middle_name               = "middle_names"
    family_name               = "family_name"
    preferred_username        = "display_name"
    "custom:idassurancelevel" = "idassurancelevel"
    "custom:nhsid_user_orgs"  = "nhsid_user_orgs"
    "custom:nhsid_useruid"    = "nhsid_useruid"
  }
}
