resource "aws_iam_role" "grafana_access" {
  name               = "${local.csi}-grafana-cross-access-role"
  assume_role_policy = data.aws_iam_policy_document.observability_grafana_role_assume_role_policy.json
}

data "aws_iam_policy_document" "observability_grafana_role_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${var.observability_account_id}:role/${local.csi}-grafana-workspace-role"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "grafana_workspace_cloudwatch" {
  role       = aws_iam_role.grafana_access.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchReadOnlyAccess"
}
