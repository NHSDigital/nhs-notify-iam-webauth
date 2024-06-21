data "aws_caller_identity" "current" {}

data "terraform_remote_state" "state" {
  backend = "s3"
  config = {
    region = "eu-west-2"
    bucket = "tf-state-${data.aws_caller_identity.current.account_id}"
    key    = "auth/dev.tfstate"
  }
}

locals {
  app_domain_name         = "app.${data.terraform_remote_state.state.outputs.zone_name}"
  user_pool_id            = data.terraform_remote_state.state.outputs.user_pool_id
  identity_provider_names = data.terraform_remote_state.state.outputs.identity_provider_names
  app_id                  = data.terraform_remote_state.state.outputs.app_id
}
