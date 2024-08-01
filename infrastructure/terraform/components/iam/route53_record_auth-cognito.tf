resource "aws_route53_record" "auth-cognito" {
  name            = aws_cognito_user_pool_domain.main.domain
  type            = "A"
  zone_id         = local.acct.dns_zone["id"]

  alias {
    # Required for Cognito auth lookup https://repost.aws/knowledge-center/cognito-custom-domain-errors
    evaluate_target_health = false
    name    = aws_cognito_user_pool_domain.main.cloudfront_distribution
    zone_id = aws_cognito_user_pool_domain.main.cloudfront_distribution_zone_id
  }
}
