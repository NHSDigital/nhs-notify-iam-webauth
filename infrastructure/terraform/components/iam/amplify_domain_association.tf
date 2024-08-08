# resource "aws_amplify_domain_association" "domain" {
#   app_id                 = aws_amplify_app.main.id
#   domain_name            = local.root_domain_name
#   enable_auto_sub_domain = true

#   sub_domain {
#     branch_name = module.amplify_branch.name
#     prefix      = ""
#   }

#   sub_domain {
#     branch_name = module.amplify_branch.name
#     prefix      = "main"
#   }
# }

# TODO CCM-6078 Revert to above amplify_domain_association resource on closure of https://github.com/hashicorp/terraform-provider-aws/issues/37498
# Provider does not correctly set autoSubDomainCreationPatterns when enable_auto_sub_domain is set
resource "null_resource" "amplify_domain_association" {
  triggers = {
    amplify_app_id      = aws_amplify_app.main.id
    amplify_branch_name = module.amplify_branch.name
    amplify_domain_name = local.root_domain_name
  }

  provisioner "local-exec" {
    when    = create
    command = "aws amplify create-domain-association --app-id ${self.triggers.amplify_app_id} --domain-name ${self.triggers.amplify_domain_name} --sub-domain-settings prefix=\"\",branchName=\"${self.triggers.amplify_branch_name}\" prefix=\"${self.triggers.amplify_branch_name}\",branchName=\"${self.triggers.amplify_branch_name}\" --enable-auto-sub-domain --auto-sub-domain-creation-patterns \"*,pr*\""
  }

  provisioner "local-exec" {
    when    = destroy
    command = "aws amplify delete-domain-association --app-id ${self.triggers.amplify_app_id} --domain-name ${self.triggers.amplify_domain_name}"
  }
}
