resource "aws_amplify_domain_association" "domain" {
  app_id                 = aws_amplify_app.main.id
  domain_name            = local.acct.dns_zone["name"]
  enable_auto_sub_domain = false

  sub_domain {
    branch_name = module.amplify_branch.name
    prefix      = ""
  }
}
