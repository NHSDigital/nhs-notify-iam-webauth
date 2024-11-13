resource "null_resource" "amplify_branch_deploy" {
  # Using triggers to force execution on every apply
  triggers = {
    always_run = timestamp()
  }

  depends_on = [module.amplify_branch]

  provisioner "local-exec" {
    command = "aws amplify start-job --app-id ${aws_amplify_app.main.id} --branch-name ${var.branch_name} --commit-message \"${replace(var.deployment_description, "\"", "\\\"")}\" --commit-id ${var.commit_id} --job-type RELEASE"
  }
}
