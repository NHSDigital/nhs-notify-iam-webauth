data "aws_ssm_parameter" "github_pat_ssm_param_name" {
  name = local.acct.github_pat_ssm_param_name
}
