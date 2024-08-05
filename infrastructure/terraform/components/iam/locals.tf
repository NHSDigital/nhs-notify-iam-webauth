locals {
  dns_prefix = "${var.environment}.${local.acct.dns_zone["name"]}"
}
