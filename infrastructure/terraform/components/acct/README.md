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
| <a name="input_component"></a> [component](#input\_component) | The variable encapsulating the name of this component | `string` | `"acct"` | no |
| <a name="input_default_tags"></a> [default\_tags](#input\_default\_tags) | A map of default tags to apply to all taggable resources within the component | `map(string)` | `{}` | no |
| <a name="input_environment"></a> [environment](#input\_environment) | The name of the tfscaffold environment | `string` | n/a | yes |
| <a name="input_group"></a> [group](#input\_group) | The group variables are being inherited from (often synonmous with account short-name) | `string` | n/a | yes |
| <a name="input_initial_cli_secrets_provision_override"></a> [initial\_cli\_secrets\_provision\_override](#input\_initial\_cli\_secrets\_provision\_override) | A map of default value to intialise SSM secret values with. Only useful for initial setup of the account due to lifecycle rules. | `map(string)` | `{}` | no |
| <a name="input_kms_deletion_window"></a> [kms\_deletion\_window](#input\_kms\_deletion\_window) | When a kms key is deleted, how long should it wait in the pending deletion state? | `string` | `"30"` | no |
| <a name="input_kms_deletion_window_test"></a> [kms\_deletion\_window\_test](#input\_kms\_deletion\_window\_test) | When a kms key is deleted, how long should it wait in the pending deletion state? | `string` | `"30"` | no |
| <a name="input_log_retention_in_days"></a> [log\_retention\_in\_days](#input\_log\_retention\_in\_days) | The retention period in days for the Cloudwatch Logs events to be retained, default of 0 is indefinite | `number` | `0` | no |
| <a name="input_oam_sink_id"></a> [oam\_sink\_id](#input\_oam\_sink\_id) | The ID of the Cloudwatch OAM sink in the appropriate observability account. | `string` | `""` | no |
| <a name="input_observability_account_id"></a> [observability\_account\_id](#input\_observability\_account\_id) | The Observability Account ID that needs access | `string` | n/a | yes |
| <a name="input_observability_environment"></a> [observability\_environment](#input\_observability\_environment) | The Observability environment to use | `string` | `"main"` | no |
| <a name="input_project"></a> [project](#input\_project) | The name of the tfscaffold project | `string` | n/a | yes |
| <a name="input_region"></a> [region](#input\_region) | The AWS Region | `string` | n/a | yes |
| <a name="input_root_domain_name"></a> [root\_domain\_name](#input\_root\_domain\_name) | The service's root DNS root nameespace, like nonprod.nhsnotify.national.nhs.uk | `string` | `"nonprod.nhsnotify.national.nhs.uk"` | no |
| <a name="input_support_sandbox_environments"></a> [support\_sandbox\_environments](#input\_support\_sandbox\_environments) | Does this account support dev sandbox environments? | `bool` | `false` | no |
## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_kms_sandbox"></a> [kms\_sandbox](#module\_kms\_sandbox) | https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-kms.zip | n/a |
| <a name="module_obs_datasource"></a> [obs\_datasource](#module\_obs\_datasource) | https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-obs-datasource.zip | n/a |
| <a name="module_s3bucket_access_logs"></a> [s3bucket\_access\_logs](#module\_s3bucket\_access\_logs) | https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-s3bucket.zip | n/a |
| <a name="module_s3bucket_backup_reports"></a> [s3bucket\_backup\_reports](#module\_s3bucket\_backup\_reports) | https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-s3bucket.zip | n/a |
| <a name="module_s3bucket_lambda_artefacts"></a> [s3bucket\_lambda\_artefacts](#module\_s3bucket\_lambda\_artefacts) | https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-s3bucket.zip | n/a |
## Outputs

| Name | Description |
|------|-------------|
| <a name="output_dns_zone"></a> [dns\_zone](#output\_dns\_zone) | n/a |
| <a name="output_github_pat_ssm_param_name"></a> [github\_pat\_ssm\_param\_name](#output\_github\_pat\_ssm\_param\_name) | n/a |
| <a name="output_log_subscription_role_arn"></a> [log\_subscription\_role\_arn](#output\_log\_subscription\_role\_arn) | n/a |
| <a name="output_s3_buckets"></a> [s3\_buckets](#output\_s3\_buckets) | n/a |
| <a name="output_sandbox_kms_key"></a> [sandbox\_kms\_key](#output\_sandbox\_kms\_key) | n/a |
<!-- vale on -->
<!-- markdownlint-enable -->
<!-- END_TF_DOCS -->
