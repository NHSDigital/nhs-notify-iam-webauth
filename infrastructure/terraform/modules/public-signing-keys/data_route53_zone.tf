data "aws_route53_zone" "main" {
  name = var.dns_zone_name

  tags = {
    Component   = "acct"
    Environment = var.environment
    Project     = var.project
  }
}
