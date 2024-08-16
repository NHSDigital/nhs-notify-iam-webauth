# Record to support Cognito Hosted UIs per https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-add-custom-domain.html
resource "aws_route53_record" "root" {
  name    = ""
  zone_id = aws_route53_zone.main.id
  type    = "A"
  ttl     = 300
  records = ["127.0.0.1"]
}
