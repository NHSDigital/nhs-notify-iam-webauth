locals {
  cognito_user_pool_domain = "auth.${local.acct.dns_zone["name"]}"
}
