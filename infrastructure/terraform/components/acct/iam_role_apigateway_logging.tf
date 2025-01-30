resource "aws_iam_role" "apigateway_logging" {
  name               = "${local.csi}-logging"
  description        = "Role used by API Gateway to write logs"
  assume_role_policy = data.aws_iam_policy_document.apigateway_assumerole.json
}

data "aws_iam_policy_document" "apigateway_assumerole" {
  statement {
    sid    = "ApigAssumeRole"
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

resource "aws_iam_role_policy" "apigateway_logging" {
  role   = aws_iam_role.apigateway_logging.name
  name   = "${local.csi}-logging"
  policy = data.aws_iam_policy_document.apigateway_logging.json
}

data "aws_iam_policy_document" "apigateway_logging" {
  statement {
    sid    = "AllowLogs"
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:DescribeLogGroups",
      "logs:DescribeLogStreams",
      "logs:PutLogEvents",
      "logs:GetLogEvents",
      "logs:FilterLogEvents",
    ]

    resources = ["*"]
  }
}

