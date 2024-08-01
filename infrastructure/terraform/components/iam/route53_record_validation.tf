resource "aws_route53_record" "validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  name            = each.value.name
  zone_id         = local.acct.dns_zone["id"]
  type            = each.value.type
  ttl             = 60

  records         = [
    each.value.record
  ]
}
