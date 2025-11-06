resource "aws_cloudwatch_event_rule" "env_destroy" {
  count = var.enable_env_destroy_event_rule ? 1 : 0
  name        = "${local.csi}-env-destroy"
  description = "Forwards Environment Destroy Failed events to Custom Event Bus in Observability Account"

  event_pattern = jsonencode({
    "source"      = ["notify.envDestroyFailed"],
  })
}

resource "aws_cloudwatch_event_target" "env_destroy" {
  count    = var.enable_env_destroy_event_rule ? 1 : 0
  rule     = aws_cloudwatch_event_rule.env_destroy[0].name
  arn      = local.event_bus_arn
  role_arn = aws_iam_role.env_destroy[0].arn
}

resource "aws_iam_role" "env_destroy" {
  count  = var.enable_env_destroy_event_rule ? 1 : 0
  name = "${local.csi}-env-destroy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "events.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_policy" "env_destroy" {
  count  = var.enable_env_destroy_event_rule ? 1 : 0
  name = "${local.csi}-env-destroy"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect   = "Allow",
      Action   = "events:PutEvents",
      Resource = local.event_bus_arn
    }]
  })
}

resource "aws_iam_role_policy_attachment" "env_destroy" {
  count      = var.enable_env_destroy_event_rule ? 1 : 0
  role       = aws_iam_role.env_destroy[0].name
  policy_arn = aws_iam_policy.env_destroy[0].arn
}
