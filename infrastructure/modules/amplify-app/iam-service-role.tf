resource "aws_iam_role" "service_role" {
  name = "${local.csi}-service-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "amplify.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "backend" {
  role       = aws_iam_role.service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmplifyBackendDeployFullAccess"
}

resource "aws_iam_role_policy" "logging" {
  role = aws_iam_role.service_role.id
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Sid" : "PushLogs",
        "Effect" : "Allow",
        "Action" : [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        "Resource" : "arn:aws:logs:eu-west-2:${local.account_id}:log-group:/aws/amplify/${aws_amplify_app.app.id}:log-stream:*"
      },
      {
        "Sid" : "DescribeLogGroups",
        "Effect" : "Allow",
        "Action" : "logs:DescribeLogGroups",
        "Resource" : "arn:aws:logs:eu-west-2:${local.account_id}:log-group:*"
      }
    ]
  })
}
