resource "aws_cognito_user_pool_domain" "main" {
  domain          = aws_acm_certificate.main.domain_name
  certificate_arn = aws_acm_certificate.main.arn
  user_pool_id    = aws_cognito_user_pool.main.id

  depends_on = [
    aws_acm_certificate_validation.main,
  ]
}
