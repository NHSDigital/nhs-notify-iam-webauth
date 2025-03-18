resource "aws_route53_record" "alias_A" {
  name    = local.root_domain_name
  zone_id = data.aws_route53_zone.main.id
  type    = "A"

  alias {
    name    = aws_cloudfront_distribution.main.domain_name
    zone_id = aws_cloudfront_distribution.main.hosted_zone_id

    evaluate_target_health = false
  }
}

resource "aws_route53_record" "alias_AAAA" {
  name    = local.root_domain_name
  zone_id = data.aws_route53_zone.main.id
  type    = "AAAA"

  alias {
    name    = aws_cloudfront_distribution.main.domain_name
    zone_id = aws_cloudfront_distribution.main.hosted_zone_id

    evaluate_target_health = false
  }
}
