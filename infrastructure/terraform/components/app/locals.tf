locals {
  root_domain_name              = "${var.environment}.${local.acct.dns_zone["name"]}"
  aws_lambda_functions_dir_path = "../../../../lambdas"
  auth_domain_name              = "auth.${local.root_domain_name}"

  auth_gateway_name = coalesce(
    var.cognito_user_pool_group_specific_gateway_callback_url,
    var.cognito_user_pool_use_environment_specific_gateway_callback_url
    ? "https://${var.environment}.${var.cognito_user_pool_environment_specific_gateway_callback_url_suffix}"
  : "https://${aws_amplify_app.main.default_domain}/auth/oauth2")

  auth_signout_redirect_domain = coalesce(
    var.cognito_user_pool_group_specific_gateway_logout_url,
    var.cognito_user_pool_use_environment_specific_gateway_callback_url
    ? "https://${var.environment}.${var.cognito_user_pool_environment_specific_gateway_logout_url_suffix}"
  : "https://${aws_amplify_app.main.default_domain}/auth")

  cis2_issuer_urls = {
    int : "https://am.nhsint.auth-ptl.cis2.spineservices.nhs.uk:443/openam/oauth2/realms/root/realms/NHSIdentity/realms/Healthcare"
    live : "https://am.nhsidentity.spineservices.nhs.uk:443/openam/oauth2/realms/root/realms/NHSIdentity/realms/Healthcare"
  }
  cis2_idp_name             = "CIS2-${var.cis2_environment}"
  cognito_idp               = var.enable_cognito_built_in_idp ? ["COGNITO"] : []
  cis2_idp                  = var.enable_cis2_idp ? [local.cis2_idp_name] : []
  use_custom_cognito_domain = var.branch_name == "main"

  log_destination_arn = var.group == "nhs-notify-iam-prod" ? "arn:aws:logs:${var.region}:${var.observability_account_id}:destination:nhs-notify-main-acct-firehose-logs" : "arn:aws:logs:${var.region}:${var.observability_account_id}:destination:nhs-main-obs-firehose-logs" #Please remove this after we do dev/nonprod cutover for this BC
}
