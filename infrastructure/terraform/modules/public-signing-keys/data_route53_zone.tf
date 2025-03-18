data "aws_route53_zone" "main" {
  zone_id = var.dns_zone_id
}
