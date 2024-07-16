# resource "aws_cognito_user_pool_domain" "domain" {
#   user_pool_id = aws_cognito_user_pool.main.id
#   domain       = local.acct.dns_zone["name"]
#   certificate_arn = aws_acm_certificate.main.arn
# }
