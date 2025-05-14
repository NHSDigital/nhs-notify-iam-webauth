<!-- BEGIN_TF_DOCS -->
<!-- markdownlint-disable -->
<!-- vale off -->

## Requirements

No requirements.
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_aws_account_id"></a> [aws\_account\_id](#input\_aws\_account\_id) | The AWS Account ID (numeric) | `string` | n/a | yes |
| <a name="input_cis2_url"></a> [cis2\_url](#input\_cis2\_url) | CSI from the parent component | `string` | n/a | yes |
| <a name="input_log_destination_arn"></a> [cloudwatch\_log\_destination\_arn](#input\_cloudwatch\_log\_destination\_arn) | Destination ARN to use for the log subscription filter | `string` | `""` | no |
| <a name="input_component"></a> [component](#input\_component) | The variable encapsulating the name of this component | `string` | `"api"` | no |
| <a name="input_csi"></a> [csi](#input\_csi) | CSI from the parent component | `string` | n/a | yes |
| <a name="input_environment"></a> [environment](#input\_environment) | The name of the tfscaffold environment | `string` | n/a | yes |
| <a name="input_filter_pattern"></a> [filter\_pattern](#input\_filter\_pattern) | Filter pattern to use for the log subscription filter | `string` | `""` | no |
| <a name="input_group"></a> [group](#input\_group) | The group variables are being inherited from (often synonmous with account short-name) | `string` | n/a | yes |
| <a name="input_log_retention_in_days"></a> [log\_retention\_in\_days](#input\_log\_retention\_in\_days) | The retention period in days for the Cloudwatch Logs events to be retained, default of 0 is indefinite | `number` | `0` | no |
| <a name="input_log_subscription_role_arn"></a> [log\_subscription\_role\_arn](#input\_log\_subscription\_role\_arn) | The ARN of the IAM role to use for the log subscription filter | `string` | `""` | no |
| <a name="input_project"></a> [project](#input\_project) | The name of the tfscaffold project | `string` | n/a | yes |
| <a name="input_region"></a> [region](#input\_region) | The AWS Region | `string` | n/a | yes |
## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_authorize_lambda"></a> [authorize\_lambda](#module\_authorize\_lambda) | ../lambda-function | n/a |
| <a name="module_build_cis2_lambdas"></a> [build\_cis2\_lambdas](#module\_build\_cis2\_lambdas) | ../typescript-build-zip | n/a |
| <a name="module_token_lambda"></a> [token\_lambda](#module\_token\_lambda) | ../lambda-function | n/a |
## Outputs

| Name | Description |
|------|-------------|
| <a name="output_api_base_url"></a> [api\_base\_url](#output\_api\_base\_url) | n/a |
<!-- vale on -->
<!-- markdownlint-enable -->
<!-- END_TF_DOCS -->
