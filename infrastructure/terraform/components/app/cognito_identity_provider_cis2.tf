resource "aws_cognito_identity_provider" "cis2_idp" {
  count = var.enable_cis2_idp ? 1 : 0

  user_pool_id  = aws_cognito_user_pool.main.id
  provider_name = local.cis2_idp_name
  provider_type = "OIDC"

  provider_details = {
    authorize_scopes          = "openid profile email nhsperson associatedorgs"
    client_id                 = aws_ssm_parameter.cis2_client_credentials_client_id.value
    client_secret             = aws_ssm_parameter.cis2_client_credentials_client_secret.value
    oidc_issuer               = local.cis2_issuer_urls[var.cis2_environment]
    attributes_request_method = "GET"
  }

  attribute_mapping = {
    email                         = "email"
    username                      = "sub"
    given_name                    = "given_name"
    middle_name                   = "middle_names"
    family_name                   = "family_name"
    preferred_username            = "display_name"
    "custom:idassurancelevel"     = "idassurancelevel"
    "custom:nhsid_user_orgs"      = "nhsid_user_orgs"
    "custom:nhsid_useruid"        = "nhsid_useruid"
    "custom:id_assurance_level"   = "id_assurance_level"
    "custom:auth_assurance_level" = "authentication_assurance_level"
    "custom:auth_time"            = "auth_time"
  }
}
