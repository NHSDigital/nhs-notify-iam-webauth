locals {
  event_bus_arn = "arn:aws:events:eu-west-2:${var.observability_account_id}:event-bus/nhs-notify-${var.observability_environment}-acct-alerts-bus"
}
