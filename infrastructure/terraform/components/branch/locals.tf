locals {
  dns_prefix             = "${var.environment}.${local.iam.amplify["domain_name"]}"
  normalised_branch_name = lower(substr(join("", regexall("[a-zA-Z0-9-]+", var.branch_name)), 0, 25))
}
