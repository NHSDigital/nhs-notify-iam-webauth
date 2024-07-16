resource "aws_ssm_parameter" "github_pat" {
  name        = "/${local.csi}/github_pat"
  description = "A GitHub PAT token for settings up AWS Amplify. This is only used at initial setup of the service"
  type        = "SecureString"
  value       = try(var.initial_cli_secrets_provision_override.github_pat, "UNSET")

  lifecycle {
    ignore_changes = [value]
  }
}

# This can be set at provision time like:
# PARAM_OBJECT=$(jq -n \
#   --arg github_pat "github_pat_123abc" \
#   '{github_pat:$github_pat}' | jq -R)
# .bin/terraform <args> .. -a apply -- -var="initial_cli_secrets_provision_override=${PARAM_OBJECT}"
