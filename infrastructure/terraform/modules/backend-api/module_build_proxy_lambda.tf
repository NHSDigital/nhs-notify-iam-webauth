module "build_proxy_lambda" {
  source = "../typescript-build-zip"

  source_code_dir = abspath("${local.lambdas_source_code_dir}/proxy")
  entrypoints = [
    "src/handler.ts"
  ]
}
