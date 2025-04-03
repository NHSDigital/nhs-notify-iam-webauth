data "aws_kms_key" "sandbox" {
  key_id = "alias/${var.project}-main-acct-sandbox"
}
