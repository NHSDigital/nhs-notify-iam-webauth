resource "aws_sns_topic" "costs" {
  name              = "${local.csi}-costs"
  kms_master_key_id = module.kms.key_id
}

resource "aws_sns_topic_policy" "costs" {
  arn = aws_sns_topic.costs.arn

  policy = data.aws_iam_policy_document.sns_costs.json
}

data "aws_iam_policy_document" "sns_costs" {
  statement {
    sid    = "AllowSNSCosts"
    effect = "Allow"

    actions = [
      "SNS:Publish",
    ]

    resources = [
      aws_sns_topic.costs.arn,
    ]

    principals {
      type        = "Service"
      identifiers = ["budgets.amazonaws.com", "costalerts.amazonaws.com"]
    }
  }
}

resource "aws_sns_topic_subscription" "costs" {
  for_each  = toset(var.cost_alarm_recipients)
  topic_arn = aws_sns_topic.costs.arn
  protocol  = "email"
  endpoint  = each.value
}
