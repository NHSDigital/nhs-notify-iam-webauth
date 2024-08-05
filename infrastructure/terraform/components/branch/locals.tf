locals {
  dns_prefix = "${var.environment}.${local.iam.amplify["domain_name"]}"
}
