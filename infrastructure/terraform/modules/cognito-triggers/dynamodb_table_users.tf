resource "aws_dynamodb_table" "users" {
  name         = "${var.csi}-users"
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "PK"
  range_key = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = var.kms_key_arn
  }

  tags = {
    "NHSE-Enable-Dynamo-Backup" = "False"
  }

  lifecycle {
    ignore_changes = [
      name, # To support backup and restore which will result in a new name otherwise
    ]
  }
}
