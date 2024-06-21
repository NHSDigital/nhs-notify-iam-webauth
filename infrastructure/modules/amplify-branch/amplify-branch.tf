resource "aws_amplify_branch" "branch" {
  app_id       = var.amplify_app_id
  branch_name  = var.branch
  display_name = var.subdomain
  description  = "${var.branch}"
  enable_pull_request_preview = false # PR previews are not supported for public repos

  environment_variables = {
    USER_POOL_CLIENT_ID = aws_cognito_user_pool_client.client.id
    NOTIFY_SUBDOMAIN    = var.subdomain
  }

  tags = local.deployment_default_tags
}

resource "aws_amplify_domain_association" "domain" {
  app_id      = var.amplify_app_id
  domain_name = "${var.subdomain}.${var.domain_name}"
  enable_auto_sub_domain = false

  # Wait for domain verification in prod stage environments
  wait_for_verification = var.stage == "prod"

  sub_domain {
    branch_name = aws_amplify_branch.branch.branch_name
    prefix      = ""
  }
}
