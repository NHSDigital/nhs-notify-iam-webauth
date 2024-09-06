locals {
  root_domain_name = "${var.environment}.${local.acct.dns_zone["name"]}"
  auth_domain_name = "auth.${local.root_domain_name}"
}
