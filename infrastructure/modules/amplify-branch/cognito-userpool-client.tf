resource "aws_cognito_user_pool_client" "client" {
  name         = "${local.csi}-client"
  user_pool_id = var.cognito_user_pool_id

  callback_urls = flatten([
    ["https://${var.subdomain}.${var.domain_name}/auth/", "https://${var.subdomain}.${var.amplify_app_id}.amplifyapp.com/auth/"],
      var.stage == "nonprod" ? ["http://localhost:3000/auth/"] :
        var.environment == "prod" ? ["https://notify.nhs.net/auth/"] : []
  ])
  supported_identity_providers = flatten([
      var.stage == "nonprod" ? ["COGNITO"] : [],
    var.cognito_user_pool_identity_provider_names
  ])
  allowed_oauth_flows = ["code"]
  allowed_oauth_scopes = [
    "openid",
    "email",
    "phone",
    "profile",
    "aws.cognito.signin.user.admin"
  ]
}
