locals {
  root_domain_name = "jwks.${var.environment}.${data.aws_route53_zone.main.name}" # e.g. jwks.[main|dev|abxy0].foo.[dev|nonprod|prod].nhsnotify.national.nhs.uk
}
