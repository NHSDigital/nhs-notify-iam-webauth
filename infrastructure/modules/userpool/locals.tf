locals {
  # Compound Scope Identifier
  csi = replace(
    format(
      "%s-%s-%s-%s",
      var.domain,
      var.environment,
      var.component,
      var.module,
    ),
    "_",
    "",
  )

  deployment_default_tags = {
    Domain     = var.domain
    Environment = var.environment
    Component   = var.component
    Module      = var.module
  }
}
