module "build_pre_authentication_lambda" {
  source = "../typescript-build-zip"

  source_code_dir = abspath("${local.lambdas_source_code_dir}/pre-authentication")
  entrypoints = [
    "src/handler.ts",
  ]
}
