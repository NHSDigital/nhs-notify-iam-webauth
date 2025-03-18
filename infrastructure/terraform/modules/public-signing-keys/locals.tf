locals {
  root_domain_name = "${var.environment}.${data.aws_route53_zone.main.name}" # e.g. [main|dev|abxy0].foo.[dev|nonprod|prod].nhsnotify.national.nhs.uk
}
