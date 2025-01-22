resource "aws_lambda_function" "main" {
  description      = var.description
  function_name    = var.function_name
  role             = aws_iam_role.lambda_execution_role.arn
  filename         = var.filename
  source_code_hash = var.source_code_hash
  handler          = var.handler
  runtime          = var.runtime

  environment {
    variables = var.environment_variables
  }
}
