locals {
  root_domain_name = "${var.environment}.${local.iam.amplify["domain_name"]}"
}
