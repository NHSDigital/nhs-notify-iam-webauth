locals {
  root_domain_name       = "${var.environment}.${local.app.amplify["domain_name"]}"
  normalised_branch_name = trimsuffix(lower(substr(join("", regexall("[a-zA-Z0-9-]+", var.branch_name)), 0, 25)), "-")
}
