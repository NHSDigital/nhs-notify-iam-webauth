resource "aws_route53_record" "cognito_alias" {
  count = var.branch_name == "main" ? 1 : 0

  name    = aws_cognito_user_pool_domain.custom[0].domain
  zone_id = local.acct.dns_zone["id"]
  type    = "A"

  alias {
    evaluate_target_health = false

    name    = aws_cognito_user_pool_domain.main.cloudfront_distribution
    zone_id = aws_cognito_user_pool_domain.main.cloudfront_distribution_zone_id
  }
}

resource "aws_route53_record" "cognito_ipv6_alias" {
  count = var.branch_name == "main" ? 1 : 0

  name    = aws_cognito_user_pool_domain.custom[0].domain
  zone_id = local.acct.dns_zone["id"]
  type    = "AAAA"

  alias {
    evaluate_target_health = false

    name    = aws_cognito_user_pool_domain.main.cloudfront_distribution
    zone_id = aws_cognito_user_pool_domain.main.cloudfront_distribution_zone_id
  }
}
