<!-- BEGIN_TF_DOCS -->
<!-- markdownlint-disable -->
<!-- vale off -->

## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.10.1 |
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | ~> 5.50 |
| <a name="requirement_github"></a> [github](#requirement\_github) | ~> 6.0 |
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_AMPLIFY_BASIC_AUTH_SECRET"></a> [AMPLIFY\_BASIC\_AUTH\_SECRET](#input\_AMPLIFY\_BASIC\_AUTH\_SECRET) | Secret key/password to use for Amplify Basic Auth - This is entended to be read from CI variables and not commited to any codebase | `string` | `"unset"` | no |
| <a name="input_CSRF_SECRET"></a> [CSRF\_SECRET](#input\_CSRF\_SECRET) | Secure cryptographic key to be used for generating CSRF tokens - This is entended to be read from CI variables and not commited to any codebase | `string` | `"unset"` | no |
| <a name="input_aws_account_id"></a> [aws\_account\_id](#input\_aws\_account\_id) | The AWS Account ID (numeric) | `string` | n/a | yes |
| <a name="input_aws_principal_org_id"></a> [aws\_principal\_org\_id](#input\_aws\_principal\_org\_id) | The AWS Org ID (numeric) | `string` | n/a | yes |
| <a name="input_backup_report_recipient"></a> [backup\_report\_recipient](#input\_backup\_report\_recipient) | Primary recipient of the Backup reports | `string` | `""` | no |
| <a name="input_backup_schedule_cron"></a> [backup\_schedule\_cron](#input\_backup\_schedule\_cron) | Defines the backup schedule in AWS Cron Expression format | `string` | `"cron(0 2 * * ? *)"` | no |
| <a name="input_branch_name"></a> [branch\_name](#input\_branch\_name) | The branch name to deploy | `string` | `"main"` | no |
| <a name="input_cis2_auth_mode"></a> [cis2\_auth\_mode](#input\_cis2\_auth\_mode) | The authentication mode used between NHS Notify and CIS2 | `string` | `"client_secret"` | no |
| <a name="input_cis2_environment"></a> [cis2\_environment](#input\_cis2\_environment) | Name of the CIS2 environment, e.g. mock, int, live. See: https://digital.nhs.uk/services/care-identity-service/applications-and-services/cis2-authentication/guidance-for-developers/detailed-guidance/registration | `string` | `""` | no |
| <a name="input_cognito_prevent_deletion"></a> [cognito\_prevent\_deletion](#input\_cognito\_prevent\_deletion) | Prevents accidental deletion of the cognito user pool | `bool` | `true` | no |
| <a name="input_cognito_user_pool_additional_callback_urls"></a> [cognito\_user\_pool\_additional\_callback\_urls](#input\_cognito\_user\_pool\_additional\_callback\_urls) | A list of additional callback\_urls for the cognito user pool | `list(string)` | `[]` | no |
| <a name="input_cognito_user_pool_additional_logout_urls"></a> [cognito\_user\_pool\_additional\_logout\_urls](#input\_cognito\_user\_pool\_additional\_logout\_urls) | A list of additional logout\_urls for the cognito user pool | `list(string)` | `[]` | no |
| <a name="input_cognito_user_pool_environment_specific_gateway_callback_url_suffix"></a> [cognito\_user\_pool\_environment\_specific\_gateway\_callback\_url\_suffix](#input\_cognito\_user\_pool\_environment\_specific\_gateway\_callback\_url\_suffix) | The suffix for the environment specific web gateway callback URL - should be prefixed with with protocol and environment name | `string` | `""` | no |
| <a name="input_cognito_user_pool_environment_specific_gateway_logout_url_suffix"></a> [cognito\_user\_pool\_environment\_specific\_gateway\_logout\_url\_suffix](#input\_cognito\_user\_pool\_environment\_specific\_gateway\_logout\_url\_suffix) | The suffix for the environment specific web gateway logout callback URL - should be prefixed with with protocol and environment name | `string` | `""` | no |
| <a name="input_cognito_user_pool_group_specific_gateway_callback_url"></a> [cognito\_user\_pool\_group\_specific\_gateway\_callback\_url](#input\_cognito\_user\_pool\_group\_specific\_gateway\_callback\_url) | Group-specific web gateway callback URL - for environments such as production that do not contain an environment name | `string` | `null` | no |
| <a name="input_cognito_user_pool_group_specific_gateway_logout_url"></a> [cognito\_user\_pool\_group\_specific\_gateway\_logout\_url](#input\_cognito\_user\_pool\_group\_specific\_gateway\_logout\_url) | Group-specific web gateway callback URL - for environments such as production that do not contain an environment name | `string` | `null` | no |
| <a name="input_cognito_user_pool_use_environment_specific_gateway_callback_url"></a> [cognito\_user\_pool\_use\_environment\_specific\_gateway\_callback\_url](#input\_cognito\_user\_pool\_use\_environment\_specific\_gateway\_callback\_url) | Enable an environment specific web gateway callback URL - for use in environments that are using dynamic domains | `bool` | `false` | no |
| <a name="input_commit_id"></a> [commit\_id](#input\_commit\_id) | The commit to deploy. Must be in the tree for branch\_name | `string` | `"HEAD"` | no |
| <a name="input_component"></a> [component](#input\_component) | The variable encapsulating the name of this component | `string` | `"app"` | no |
| <a name="input_default_tags"></a> [default\_tags](#input\_default\_tags) | A map of default tags to apply to all taggable resources within the component | `map(string)` | `{}` | no |
| <a name="input_destination_vault_arn"></a> [destination\_vault\_arn](#input\_destination\_vault\_arn) | ARN of the backup vault in the destination account, if this environment should be backed up | `string` | `null` | no |
| <a name="input_enable_amplify_basic_auth"></a> [enable\_amplify\_basic\_auth](#input\_enable\_amplify\_basic\_auth) | Enable a basic set of credentials in the form of a dynamically generated username and password for the amplify app branches. Not intended for production use | `bool` | `true` | no |
| <a name="input_enable_amplify_branch_auto_build"></a> [enable\_amplify\_branch\_auto\_build](#input\_enable\_amplify\_branch\_auto\_build) | Enable automatic building of branches | `bool` | `false` | no |
| <a name="input_enable_cis2_idp"></a> [enable\_cis2\_idp](#input\_enable\_cis2\_idp) | Switch to enable the CIS2 Cognito federation | `bool` | `true` | no |
| <a name="input_enable_cognito_built_in_idp"></a> [enable\_cognito\_built\_in\_idp](#input\_enable\_cognito\_built\_in\_idp) | Enable the use of Cognito as an IDP; CIS2 is preferred | `bool` | `false` | no |
| <a name="input_environment"></a> [environment](#input\_environment) | The name of the tfscaffold environment | `string` | n/a | yes |
| <a name="input_force_lambda_code_deploy"></a> [force\_lambda\_code\_deploy](#input\_force\_lambda\_code\_deploy) | If the lambda package in s3 has the same commit id tag as the terraform build branch, the lambda will not update automatically. Set to True if making changes to Lambda code from on the same commit for example during development | `bool` | `false` | no |
| <a name="input_group"></a> [group](#input\_group) | The group variables are being inherited from (often synonmous with account short-name) | `string` | n/a | yes |
| <a name="input_kms_deletion_window"></a> [kms\_deletion\_window](#input\_kms\_deletion\_window) | When a kms key is deleted, how long should it wait in the pending deletion state? | `string` | `"30"` | no |
| <a name="input_log_level"></a> [log\_level](#input\_log\_level) | The log level to be used in lambda functions within the component. Any log with a lower severity than the configured value will not be logged: https://docs.python.org/3/library/logging.html#levels | `string` | `"INFO"` | no |
| <a name="input_log_retention_in_days"></a> [log\_retention\_in\_days](#input\_log\_retention\_in\_days) | The retention period in days for the Cloudwatch Logs events to be retained, default of 0 is indefinite | `number` | `0` | no |
| <a name="input_observability_account_id"></a> [observability\_account\_id](#input\_observability\_account\_id) | The Observability Account ID that needs access | `string` | n/a | yes |
| <a name="input_parent_acct_environment"></a> [parent\_acct\_environment](#input\_parent\_acct\_environment) | Name of the environment responsible for the acct resources used, affects things like DNS zone. Useful for named dev environments | `string` | `"main"` | no |
| <a name="input_project"></a> [project](#input\_project) | The name of the tfscaffold project | `string` | n/a | yes |
| <a name="input_region"></a> [region](#input\_region) | The AWS Region | `string` | n/a | yes |
| <a name="input_retention_period"></a> [retention\_period](#input\_retention\_period) | Backup Vault Retention Period | `number` | `14` | no |
| <a name="input_url_prefix"></a> [url\_prefix](#input\_url\_prefix) | The url prefix to use for the deployed branch | `string` | `"main"` | no |
## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_amplify_branch"></a> [amplify\_branch](#module\_amplify\_branch) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/amp_branch | v1.0.8 |
| <a name="module_backend_api"></a> [backend\_api](#module\_backend\_api) | ../../modules/backend-api | n/a |
| <a name="module_cognito_triggers"></a> [cognito\_triggers](#module\_cognito\_triggers) | ../../modules/cognito-triggers | n/a |
| <a name="module_kms"></a> [kms](#module\_kms) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/kms | v1.0.8 |
| <a name="module_lambda_backup_cognito_id"></a> [lambda\_backup\_cognito\_id](#module\_lambda\_backup\_cognito\_id) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda | v2.0.4 |
| <a name="module_nhse_backup_vault"></a> [nhse\_backup\_vault](#module\_nhse\_backup\_vault) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/aws-backup-source | v2.0.12 |
| <a name="module_public_signing_keys"></a> [public\_signing\_keys](#module\_public\_signing\_keys) | ../../modules/public-signing-keys | n/a |
| <a name="module_s3bucket_cognito_backup"></a> [s3bucket\_cognito\_backup](#module\_s3bucket\_cognito\_backup) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/s3bucket | v1.0.9 |
## Outputs

| Name | Description |
|------|-------------|
| <a name="output_amplify"></a> [amplify](#output\_amplify) | n/a |
| <a name="output_cognito_user_pool"></a> [cognito\_user\_pool](#output\_cognito\_user\_pool) | n/a |
| <a name="output_cognito_user_pool_client"></a> [cognito\_user\_pool\_client](#output\_cognito\_user\_pool\_client) | n/a |
| <a name="output_deployment"></a> [deployment](#output\_deployment) | Deployment details used for post-deployment scripts |
| <a name="output_kms_key_id"></a> [kms\_key\_id](#output\_kms\_key\_id) | KMS Key Id used to encrypt application data |
<!-- vale on -->
<!-- markdownlint-enable -->
<!-- END_TF_DOCS -->
