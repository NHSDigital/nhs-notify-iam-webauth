output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "cognito_user_pool_client_id" {
  value = aws_cognito_user_pool_client.main.id
}

output "cognito_domain" {
  value = "${aws_cognito_user_pool_domain.main.domain}.auth.eu-west-2.amazoncognito.com"
}

output "redirect_domain" {
  value = "http://localhost:3000/auth/"
}

output "cis2_provider_name" {
  value = "CIS2-int"
}
