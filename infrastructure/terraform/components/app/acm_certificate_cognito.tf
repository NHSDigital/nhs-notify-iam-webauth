resource "aws_acm_certificate" "cognito" {
  count = local.use_custom_cognito_domain ? 1 : 0

  provider = aws.us-east-1

  domain_name       = local.auth_domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "cognito" {
  count = local.use_custom_cognito_domain ? 1 : 0

  provider = aws.us-east-1

  certificate_arn = aws_acm_certificate.cognito[0].arn
}
