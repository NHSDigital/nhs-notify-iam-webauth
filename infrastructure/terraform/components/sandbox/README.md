<!-- BEGIN_TF_DOCS -->
<!-- markdownlint-disable -->
<!-- vale off -->

## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.9.2 |
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | ~> 5.50 |
| <a name="requirement_github"></a> [github](#requirement\_github) | ~> 6.0 |
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_aws_account_id"></a> [aws\_account\_id](#input\_aws\_account\_id) | The AWS Account ID (numeric) | `string` | n/a | yes |
| <a name="input_component"></a> [component](#input\_component) | The variable encapsulating the name of this component | `string` | `"sbx"` | no |
| <a name="input_default_tags"></a> [default\_tags](#input\_default\_tags) | A map of default tags to apply to all taggable resources within the component | `map(string)` | `{}` | no |
| <a name="input_environment"></a> [environment](#input\_environment) | The name of the tfscaffold environment | `string` | n/a | yes |
| <a name="input_group"></a> [group](#input\_group) | The group variables are being inherited from (often synonymous with account short-name) | `string` | n/a | yes |
| <a name="input_parent_acct_environment"></a> [parent\_acct\_environment](#input\_parent\_acct\_environment) | Name of the environment responsible for the acct resources used, affects things like DNS zone. Useful for named dev environments | `string` | `"main"` | no |
| <a name="input_project"></a> [project](#input\_project) | The name of the tfscaffold project | `string` | n/a | yes |
| <a name="input_region"></a> [region](#input\_region) | The AWS Region | `string` | n/a | yes |
## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_public_signing_keys"></a> [public\_signing\_keys](#module\_public\_signing\_keys) | ../../modules/public-signing-keys | n/a |
## Outputs

| Name | Description |
|------|-------------|
| <a name="output_cis2_provider_name"></a> [cis2\_provider\_name](#output\_cis2\_provider\_name) | n/a |
| <a name="output_cognito_domain"></a> [cognito\_domain](#output\_cognito\_domain) | n/a |
| <a name="output_cognito_user_pool_client_id"></a> [cognito\_user\_pool\_client\_id](#output\_cognito\_user\_pool\_client\_id) | n/a |
| <a name="output_cognito_user_pool_id"></a> [cognito\_user\_pool\_id](#output\_cognito\_user\_pool\_id) | n/a |
| <a name="output_csrf_secret"></a> [csrf\_secret](#output\_csrf\_secret) | n/a |
| <a name="output_deployment"></a> [deployment](#output\_deployment) | Deployment details used for post-deployment scripts |
| <a name="output_group_tag"></a> [group\_tag](#output\_group\_tag) | n/a |
| <a name="output_key_directory_ssm_parameter_name"></a> [key\_directory\_ssm\_parameter\_name](#output\_key\_directory\_ssm\_parameter\_name) | n/a |
| <a name="output_key_rotation_lambda_name"></a> [key\_rotation\_lambda\_name](#output\_key\_rotation\_lambda\_name) | n/a |
| <a name="output_name_tag"></a> [name\_tag](#output\_name\_tag) | n/a |
| <a name="output_public_keys_s3_bucket_name"></a> [public\_keys\_s3\_bucket\_name](#output\_public\_keys\_s3\_bucket\_name) | n/a |
| <a name="output_redirect_domain"></a> [redirect\_domain](#output\_redirect\_domain) | n/a |
| <a name="output_signout_redirect_domain"></a> [signout\_redirect\_domain](#output\_signout\_redirect\_domain) | n/a |
<!-- vale on -->
<!-- markdownlint-enable -->
<!-- END_TF_DOCS -->
