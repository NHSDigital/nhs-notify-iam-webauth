resource "null_resource" "remove_amplify_branch" {
# Dispite destroying the resouce, apparently Amplify thinks we want to keep the branch resrouce around
  triggers = {
    csi = local.csi
  }

  provisioner "local-exec" {
    when    = destroy
    command = "aws amplify delete-branch --app-id ${local.iam.amplify["id"]} --branch-name ${module.amplify_branch.name}"
  }
}


