resource "aws_ssm_document" "allocate_user_to_client" {
  name            = "${var.csi}-allocate-user-to-client"
  document_type   = "Automation"
  document_format = "YAML"

  content = templatefile("${path.module}/ssm_automation_allocate_user_to_client.tmpl.yaml", {
    CSI                = var.csi
    DYNAMO_TABLE_NAME  = aws_dynamodb_table.users.name
    USER_POOL_ID       = var.user_pool_id
    EXECUTION_ROLE_ARN = aws_iam_role.ssm_automation_allocate_user.arn
  })

  permissions = {
    type        = "Share"
    account_ids = var.aws_account_id
  }
}
