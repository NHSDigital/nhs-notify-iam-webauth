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

resource "aws_iam_role_policy_attachment" "apigateway_logging" {
  role       = aws_iam_role.apigateway_logging.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}
