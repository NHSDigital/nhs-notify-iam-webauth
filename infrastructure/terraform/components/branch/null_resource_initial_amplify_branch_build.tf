resource "null_resource" "initial_amplify_branch_build" {
  # Trigger initial build when the branch is creates. Subsequent commits to the branch would cause builds anyway
  triggers = {
    csi                 = local.csi
    amplify_app_id      = local.app.amplify["id"]
    amplify_branch_name = module.amplify_branch.name
  }

  provisioner "local-exec" {
    command = "aws amplify start-job --app-id ${self.triggers.amplify_app_id} --branch-name ${self.triggers.amplify_branch_name} --job-type 'RELEASE'"
  }
}
