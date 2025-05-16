locals {
  root_domain_name               = "jwks.${var.environment}.${data.aws_route53_zone.main.name}" # e.g. jwks.[main|dev|abxy0].foo.[dev|nonprod|prod].nhsnotify.national.nhs.uk
  lambdas_source_code_dir        = "../../../../lambdas"
  ssm_asymmetric_key_policy_name = "/${local.csi}/asymmetric_key_policy"
  ssm_key_directory_name         = "/${local.csi}/key_directory"
}
