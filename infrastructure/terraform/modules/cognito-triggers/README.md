<!-- BEGIN_TF_DOCS -->
<!-- markdownlint-disable -->
<!-- vale off -->

## Requirements

No requirements.
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_aws_account_id"></a> [aws\_account\_id](#input\_aws\_account\_id) | The AWS Account ID (numeric) | `string` | n/a | yes |
| <a name="input_component"></a> [component](#input\_component) | The variable encapsulating the name of this component | `string` | `"cog"` | no |
| <a name="input_csi"></a> [csi](#input\_csi) | CSI from the parent component | `string` | n/a | yes |
| <a name="input_environment"></a> [environment](#input\_environment) | The name of the tfscaffold environment | `string` | n/a | yes |
| <a name="input_function_s3_bucket"></a> [function\_s3\_bucket](#input\_function\_s3\_bucket) | Name of S3 bucket to upload lambda artefacts to | `string` | n/a | yes |
| <a name="input_group"></a> [group](#input\_group) | The group variables are being inherited from (often synonmous with account short-name) | `string` | n/a | yes |
| <a name="input_kms_key_arn"></a> [kms\_key\_arn](#input\_kms\_key\_arn) | KMS key ARN | `string` | n/a | yes |
| <a name="input_log_destination_arn"></a> [log\_destination\_arn](#input\_log\_destination\_arn) | Destination ARN to use for the log subscription filter | `string` | `""` | no |
| <a name="input_log_retention_in_days"></a> [log\_retention\_in\_days](#input\_log\_retention\_in\_days) | The retention period in days for the Cloudwatch Logs events to be retained, default of 0 is indefinite | `number` | `0` | no |
| <a name="input_log_subscription_role_arn"></a> [log\_subscription\_role\_arn](#input\_log\_subscription\_role\_arn) | The ARN of the IAM role to use for the log subscription filter | `string` | `""` | no |
| <a name="input_project"></a> [project](#input\_project) | The name of the tfscaffold project | `string` | n/a | yes |
| <a name="input_region"></a> [region](#input\_region) | The AWS Region | `string` | n/a | yes |
| <a name="input_send_to_firehose"></a> [send\_to\_firehose](#input\_send\_to\_firehose) | Send logs to firehose | `bool` | `true` | no |
| <a name="input_user_pool_id"></a> [user\_pool\_id](#input\_user\_pool\_id) | ID of the Cognito user pool the triggers should be applied to | `string` | n/a | yes |
## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_post_confirmation_lambda"></a> [post\_confirmation\_lambda](#module\_post\_confirmation\_lambda) | https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.29/terraform-lambda.zip | n/a |
| <a name="module_pre_authentication_lambda"></a> [pre\_authentication\_lambda](#module\_pre\_authentication\_lambda) | https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.29/terraform-lambda.zip | n/a |
| <a name="module_pre_token_generation_lambda"></a> [pre\_token\_generation\_lambda](#module\_pre\_token\_generation\_lambda) | https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.29/terraform-lambda.zip | n/a |
## Outputs

| Name | Description |
|------|-------------|
| <a name="output_client_config_parameter_path_prefix"></a> [client\_config\_parameter\_path\_prefix](#output\_client\_config\_parameter\_path\_prefix) | n/a |
| <a name="output_post_confirmation_lambda_function_arn"></a> [post\_confirmation\_lambda\_function\_arn](#output\_post\_confirmation\_lambda\_function\_arn) | n/a |
| <a name="output_pre_authentication_lambda_function_arn"></a> [pre\_authentication\_lambda\_function\_arn](#output\_pre\_authentication\_lambda\_function\_arn) | n/a |
| <a name="output_pre_token_generation_lambda_function_arn"></a> [pre\_token\_generation\_lambda\_function\_arn](#output\_pre\_token\_generation\_lambda\_function\_arn) | n/a |
| <a name="output_users_table_name"></a> [users\_table\_name](#output\_users\_table\_name) | n/a |
<!-- vale on -->
<!-- markdownlint-enable -->
<!-- END_TF_DOCS -->
