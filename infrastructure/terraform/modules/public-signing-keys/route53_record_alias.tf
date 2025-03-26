resource "aws_route53_record" "alias_A" {
  count   = var.deploy_cdn ? 1 : 0
  name    = local.root_domain_name
  zone_id = data.aws_route53_zone.main.id
  type    = "A"

  alias {
    name    = aws_cloudfront_distribution.main[0].domain_name
    zone_id = aws_cloudfront_distribution.main[0].hosted_zone_id

    evaluate_target_health = false
  }
}

resource "aws_route53_record" "alias_AAAA" {
  count   = var.deploy_cdn ? 1 : 0
  name    = local.root_domain_name
  zone_id = data.aws_route53_zone.main.id
  type    = "AAAA"

  alias {
    name    = aws_cloudfront_distribution.main[0].domain_name
    zone_id = aws_cloudfront_distribution.main[0].hosted_zone_id

    evaluate_target_health = false
  }
}
