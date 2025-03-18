resource "aws_acm_certificate" "main" {
  provider = aws.us-east-1

  domain_name       = local.root_domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "main" {
  provider        = aws.us-east-1

  certificate_arn = aws_acm_certificate.main.arn
}
