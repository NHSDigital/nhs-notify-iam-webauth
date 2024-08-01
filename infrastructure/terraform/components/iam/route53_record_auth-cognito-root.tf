resource "aws_route53_record" "auth-cognito-root" {
  # https://repost.aws/knowledge-center/cognito-custom-domain-errors
  name            = local.acct.dns_zone["name"]
  type            = "A"
  zone_id         = local.acct.dns_zone["id"]
  ttl = "60"
  records = [
    "127.0.0.1"
  ]
}
