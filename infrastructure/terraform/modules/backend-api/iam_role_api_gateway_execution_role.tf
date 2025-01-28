resource "aws_iam_role" "api_gateway_execution_role" {
  name               = "${local.csi}-apig"
  description        = "Allows API Gateway service to invoke Lambda functions"
  assume_role_policy = data.aws_iam_policy_document.api_gateway_service_trust_policy.json
}

resource "aws_iam_role_policy" "api_gateway_execution_policy" {
  role   = aws_iam_role.api_gateway_execution_role.name
  name   = "${local.csi}-apig-execution-policy"
  policy = data.aws_iam_policy_document.api_gateway_execution_policy.json
}

data "aws_iam_policy_document" "api_gateway_service_trust_policy" {
  statement {
    sid    = "ApiGatewayAssumeRole"
    effect = "Allow"

    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type = "Service"

      identifiers = [
        "apigateway.amazonaws.com"
      ]
    }
  }
}


data "aws_iam_policy_document" "api_gateway_execution_policy" {
  statement {
    sid    = "AllowInvokeLambda"
    effect = "Allow"

    actions = [
      "lambda:InvokeFunction",
    ]

    resources = [
      module.authorize_lambda.function_arn,
      module.token_lambda.function_arn,
    ]
  }
}
