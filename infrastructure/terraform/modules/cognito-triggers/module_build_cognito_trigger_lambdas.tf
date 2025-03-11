module "build_cognito_trigger_lambdas" {
  source = "../typescript-build-zip"

  source_code_dir = abspath("${path.module}/../../../../lambdas/cognito-triggers")
  entrypoints = [
    "src/post-authentication.ts",
  ]
}
