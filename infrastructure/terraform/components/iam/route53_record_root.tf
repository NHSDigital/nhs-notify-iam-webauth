# Record to support Cognito Hosted UIs per https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-add-custom-domain.html
resource "aws_route53_record" "root" {
  name    = local.root_domain_name
  zone_id = local.acct.dns_zone["id"]
  type    = "A"
  ttl     = 300
  records = ["127.0.0.1"]
}
