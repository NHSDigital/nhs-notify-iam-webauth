locals {
  root_domain_name = "${var.environment}.${local.acct.dns_zone["name"]}"
}
