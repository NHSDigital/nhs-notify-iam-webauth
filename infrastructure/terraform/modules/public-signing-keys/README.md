<!-- BEGIN_TF_DOCS -->
<!-- markdownlint-disable -->
<!-- vale off -->

## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.9.2 |
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_aws_account_id"></a> [aws\_account\_id](#input\_aws\_account\_id) | The AWS Account ID (numeric) | `string` | n/a | yes |
| <a name="input_component"></a> [component](#input\_component) | The name of the tfscaffold component | `string` | n/a | yes |
| <a name="input_default_tags"></a> [default\_tags](#input\_default\_tags) | A map of default tags to apply to all taggable resources within the component | `map(string)` | `{}` | no |
| <a name="input_deploy_cdn"></a> [deploy\_cdn](#input\_deploy\_cdn) | Toggle to control whether the CloudFront distribution and associated domain and certificate be deployed which can take some time to deploy and destroy | `bool` | `true` | no |
| <a name="input_dns_zone_id"></a> [dns\_zone\_id](#input\_dns\_zone\_id) | The base DNS zone ID | `string` | n/a | yes |
| <a name="input_enable_github_actions_ip_access"></a> [enable\_github\_actions\_ip\_access](#input\_enable\_github\_actions\_ip\_access) | Should the Github actions runner IP addresses be permitted access to this distribution. This should not be enabled in production environments | `bool` | `false` | no |
| <a name="input_environment"></a> [environment](#input\_environment) | The name of the tfscaffold environment | `string` | n/a | yes |
| <a name="input_module"></a> [module](#input\_module) | The variable encapsulating the name of this module | `string` | `"psk"` | no |
| <a name="input_project"></a> [project](#input\_project) | The name of the tfscaffold project | `string` | n/a | yes |
| <a name="input_protect_public_key_bucket"></a> [protect\_public\_key\_bucket](#input\_protect\_public\_key\_bucket) | Prevent bucket deletion if objects remain in the bucket.  Prevents accidental deletion of the bucket. | `bool` | `true` | no |
| <a name="input_region"></a> [region](#input\_region) | The AWS Region | `string` | n/a | yes |
| <a name="input_s3_access_logs_bucket_id"></a> [s3\_access\_logs\_bucket\_id](#input\_s3\_access\_logs\_bucket\_id) | S3 bucket ID for Access Logs | `string` | n/a | yes |
| <a name="input_waf_rate_limit_cdn"></a> [waf\_rate\_limit\_cdn](#input\_waf\_rate\_limit\_cdn) | The rate limit is the maximum number of CDN requests from a single IP address that are allowed in a five-minute period | `number` | `20000` | no |
## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_s3bucket_cf_logs"></a> [s3bucket\_cf\_logs](#module\_s3bucket\_cf\_logs) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/s3bucket | v1.0.9 |
| <a name="module_s3bucket_public_signing_keys"></a> [s3bucket\_public\_signing\_keys](#module\_s3bucket\_public\_signing\_keys) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/s3bucket | v1.0.9 |
## Outputs

No outputs.
<!-- vale on -->
<!-- markdownlint-enable -->
<!-- END_TF_DOCS -->
