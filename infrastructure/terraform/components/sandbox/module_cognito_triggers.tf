module "cognito_triggers" {
  source = "../../modules/cognito-triggers"

  csi = local.csi

  aws_account_id = var.aws_account_id

  user_pool = {
    arn = aws_cognito_user_pool.main.arn
  }
}
