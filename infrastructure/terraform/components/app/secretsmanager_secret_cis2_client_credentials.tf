resource "aws_secretsmanager_secret" "cis2_client_credentials" {
  name                    = "${var.environment}/federation/credentials/cis2-${var.cis2_environment}"
  recovery_window_in_days = 0
}

variable "placeholder_credentials" {
  default = {
    client_id     = "placeholder"
    client_secret = "placeholder"
  }
  type = map(string)
}

resource "aws_secretsmanager_secret_version" "initialisation" {
  secret_id     = aws_secretsmanager_secret.cis2_client_credentials.id
  secret_string = jsonencode(var.placeholder_credentials)
}
