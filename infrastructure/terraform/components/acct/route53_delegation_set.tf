resource "aws_route53_delegation_set" "main" {
  reference_name = "iam.${var.root_domain_name}"
}
