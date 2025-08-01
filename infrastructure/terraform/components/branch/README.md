<!-- BEGIN_TF_DOCS -->
<!-- markdownlint-disable -->
<!-- vale off -->

## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.10.1 |
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | ~> 5.50 |
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_aws_account_id"></a> [aws\_account\_id](#input\_aws\_account\_id) | The AWS Account ID (numeric) | `string` | n/a | yes |
| <a name="input_branch_name"></a> [branch\_name](#input\_branch\_name) | The branch name to deploy | `string` | `"branch"` | no |
| <a name="input_component"></a> [component](#input\_component) | The variable encapsulating the name of this component | `string` | `"branch"` | no |
| <a name="input_default_tags"></a> [default\_tags](#input\_default\_tags) | A map of default tags to apply to all taggable resources within the component | `map(string)` | `{}` | no |
| <a name="input_environment"></a> [environment](#input\_environment) | The name of the tfscaffold environment | `string` | n/a | yes |
| <a name="input_group"></a> [group](#input\_group) | The group variables are being inherited from (often synonmous with account short-name) | `string` | n/a | yes |
| <a name="input_parent_amplify_environment"></a> [parent\_amplify\_environment](#input\_parent\_amplify\_environment) | The name of the environment which deployed the parent Amplify resource. Used to identify the appropriate state file. | `string` | `"main"` | no |
| <a name="input_project"></a> [project](#input\_project) | The name of the tfscaffold project | `string` | n/a | yes |
| <a name="input_region"></a> [region](#input\_region) | The AWS Region | `string` | n/a | yes |
## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_amplify_branch"></a> [amplify\_branch](#module\_amplify\_branch) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/amp_branch | v1.0.8 |
## Outputs

No outputs.
<!-- vale on -->
<!-- markdownlint-enable -->
<!-- END_TF_DOCS -->
