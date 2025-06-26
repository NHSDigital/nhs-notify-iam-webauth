resource "aws_ce_anomaly_monitor" "anomaly_monitor" {
  name              = "${local.csi}-anomaly-monitor"
  monitor_type      = "DIMENSIONAL"
  monitor_dimension = "SERVICE"
}

resource "aws_ce_anomaly_subscription" "realtime_subscription" {
  name      = "${local.csi}-realtime-subscription"
  frequency = "IMMEDIATE"
  threshold_expression {
    dimension {
      key           = "ANOMALY_TOTAL_IMPACT_PERCENTAGE"
      values        = [var.cost_anomaly_threshold]
      match_options = ["GREATER_THAN_OR_EQUAL"]
    }
  }
  monitor_arn_list = [
    aws_ce_anomaly_monitor.anomaly_monitor.arn,
  ]

  subscriber {
    type    = "SNS"
    address = aws_sns_topic.costs.arn
  }
  depends_on = [
    aws_sns_topic_policy.costs,
  ]
}
