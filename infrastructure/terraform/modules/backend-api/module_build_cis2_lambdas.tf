module "build_cis2_lambdas" {
  source = "../typescript-build-zip"

  source_code_dir = abspath("${local.lambdas_source_code_dir}/cis2-api")
  entrypoints = [
    "src/authorize-handler.ts",
    "src/token-handler.ts"
  ]
}
