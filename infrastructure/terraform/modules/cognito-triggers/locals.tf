locals {
  csi                                 = "${var.csi}"
  client_config_parameter_path_prefix = "/${var.project}-${var.environment}-${var.component}/clients"
  lambdas_dir                         = "../../../../lambdas"
}
