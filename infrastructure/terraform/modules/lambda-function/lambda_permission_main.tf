resource "aws_lambda_permission" "main" {
  for_each = var.resource_policies

  function_name = var.function_name

  statement_id   = try(each.value.statement_id, each.key)
  action         = each.value.action
  principal      = each.value.principal
  source_arn     = try(each.value.source_arn, null)
  source_account = try(each.value.source_account, null)
}
