resource "null_resource" "remove_amplify_branch" {
  # Despite destroying the resource, apparently Amplify thinks we want to keep the branch resource around
  triggers = {
    csi                 = local.csi
    amplify_branch_name = module.amplify_branch.name
  }

  provisioner "local-exec" {
    when    = destroy
    command = "aws amplify delete-branch --app-id ${self.triggers.amplify_app_id} --branch-name ${self.triggers.amplify_branch_name}"
  }
}
