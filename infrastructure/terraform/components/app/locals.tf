locals {
  root_domain_name = "${var.environment}.${local.acct.dns_zone["name"]}"
  auth_domain_name = "auth.${local.root_domain_name}"
  cis2_issuer_urls = {
    int : "https://am.nhsint.auth-ptl.cis2.spineservices.nhs.uk:443/openam/oauth2/realms/root/realms/NHSIdentity/realms/Healthcare"
    live : "https://am.nhsidentity.spineservices.nhs.uk:443/openam/oauth2/realms/root/realms/NHSIdentity/realms/Healthcare"
  }
  cis2_idp_name = "CIS2-${var.cis2_environment}"
  cognito_idp   = var.enable_cognito_built_in_idp ? ["COGNITO"] : []
  cis2_idp      = var.enable_cis2_idp ? [local.cis2_idp_name] : []
}
