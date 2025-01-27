module "build_pre_authentication_lambda" {
  source = "../typescript-build-zip"

  source_code_dir = abspath("${path.module}/../../../../lambdas/pre-authentication")
  entrypoints = [
    "src/handler.ts",
  ]
}
