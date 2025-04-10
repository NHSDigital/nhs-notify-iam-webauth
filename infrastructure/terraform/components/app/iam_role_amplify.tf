resource "aws_iam_role" "amplify" {
  name               = "${local.csi}-service-role"
  assume_role_policy = data.aws_iam_policy_document.assumerole_amplify.json
}

data "aws_iam_policy_document" "assumerole_amplify" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["amplify.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role_policy_attachment" "amplify_amplify_backend_built_in" {
  role       = aws_iam_role.amplify.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmplifyBackendDeployFullAccess"
}

resource "aws_iam_role_policy_attachment" "amplify_amplify" {
  role       = aws_iam_role.amplify.name
  policy_arn = aws_iam_policy.amplify.arn
}

resource "aws_iam_policy" "amplify" {
  name        = "${local.csi}-amplify"
  description = "Amplify "
  policy      = data.aws_iam_policy_document.amplify.json
}

data "aws_iam_policy_document" "amplify" {
  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    #trivy:ignore:aws-iam-no-policy-wildcards
    resources = [
      "${aws_cloudwatch_log_group.amplify.arn}:*",
      "${aws_cloudwatch_log_group.amplify.arn}:log-stream:*",
    ]
  }
  statement {
    effect = "Allow"

    actions = [
      "logs:DescribeLogGroups",
    ]

    #trivy:ignore:aws-iam-no-policy-wildcards
    resources = [
      "arn:aws:logs:${var.region}:${var.aws_account_id}:*"
    ]
  }
}
