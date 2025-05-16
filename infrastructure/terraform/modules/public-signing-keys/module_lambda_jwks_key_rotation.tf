module "lambda_jwks_key_rotation" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda?ref=v2.0.2"

  providers = {
    aws = aws
  }

  function_name = "jwks-key-rotation"
  description   = "A function for rotating CIS2 JWKS signing keys"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region
  group          = var.group

  log_retention_in_days = var.log_retention_in_days
  kms_key_arn           = var.kms_key_arn

  iam_policy_document = {
    body = data.aws_iam_policy_document.lambda_jwks_key_rotation.json
  }

  function_s3_bucket       = var.function_s3_bucket
  function_code_base_path  = local.lambdas_source_code_dir
  function_code_dir        = "jwks-key-rotation/dist"
  function_include_common  = true
  function_module_name     = "handler"
  runtime                  = "nodejs20.x"
  memory                   = 128
  timeout                  = 5
  log_level                = var.log_level
  schedule                 = "rate(28 days)"
  force_lambda_code_deploy = true

  lambda_env_vars = {
    "SSM_KEY_DIRECTORY_NAME"     = local.ssm_key_directory_name,
    "SSM_ASYMMETRIC_KEY_POLICY"  = local.ssm_asymmetric_key_policy_name,
    "KEY_TAGS"                   = join(",", formatlist("%s=%s", keys(var.default_tags), values(var.default_tags))),
    "REGION"                     = var.region,
    "ACCOUNT_ID"                 = var.aws_account_id
    "S3_PUBLIC_KEYS_BUCKET_NAME" = module.s3bucket_public_signing_keys.bucket
  }
}

data "aws_iam_policy_document" "lambda_jwks_key_rotation" {
  statement {
    sid    = "KMSPermissions"
    effect = "Allow"

    actions = [
      "kms:Create*",
      "kms:DescribeKey",
      "kms:Get*",
      "kms:List*",
      "kms:Put*",
      "kms:ScheduleKeyDeletion",
      "kms:TagResource"
    ]

    resources = [
      "*"
    ]
  }

  statement {
    sid    = "AllowSSMParametersRead"
    effect = "Allow"
    actions = [
      "ssm:GetParameter"
    ]
    resources = [
      "arn:aws:ssm:${var.region}:${var.aws_account_id}:parameter${local.ssm_asymmetric_key_policy_name}",
      "arn:aws:ssm:${var.region}:${var.aws_account_id}:parameter${local.ssm_key_directory_name}"
    ]
  }

  statement {
    sid    = "AllowSSMParametersWrite"
    effect = "Allow"
    actions = [
      "ssm:PutParameter"
    ]
    resources = [
      "arn:aws:ssm:${var.region}:${var.aws_account_id}:parameter${local.ssm_key_directory_name}"
    ]
  }

  statement {
    sid    = "AllowS3PublicSigningKeysWrite"
    effect = "Allow"

    actions = [
      "s3:PutObject",
      "s3:PutObjectVersion",
      "s3:PutObjectTagging",
      "s3:PutObjectVersionTagging",
    ]

    resources = ["${module.s3bucket_public_signing_keys.arn}/*"]
  }
}
