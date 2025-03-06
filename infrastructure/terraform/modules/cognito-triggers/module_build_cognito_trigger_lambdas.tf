module "build_cognito_trigger_lambdas" {
  source = "../typescript-build-zip"

  source_code_dir = abspath("${local.lambdas_source_code_dir}/cognito-triggers")
  entrypoints = [
    "src/post-authentication.ts",
  ]
}
