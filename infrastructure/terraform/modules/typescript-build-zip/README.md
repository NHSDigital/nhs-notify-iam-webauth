<!-- BEGIN_TF_DOCS -->
<!-- markdownlint-disable -->
<!-- vale off -->

## Requirements

No requirements.
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_entrypoints"></a> [entrypoints](#input\_entrypoints) | Entrypoint filenames (relative to source\_code\_dir) | `list(string)` | n/a | yes |
| <a name="input_output_dir"></a> [output\_dir](#input\_output\_dir) | Name of the build output directory (relative to source\_code\_dir) | `string` | `"dist"` | no |
| <a name="input_source_code_dir"></a> [source\_code\_dir](#input\_source\_code\_dir) | Path to the root directory of the TypeScript project to build | `string` | n/a | yes |
## Modules

No modules.
## Outputs

| Name | Description |
|------|-------------|
| <a name="output_zips"></a> [zips](#output\_zips) | n/a |
<!-- vale on -->
<!-- markdownlint-enable -->
<!-- END_TF_DOCS -->
