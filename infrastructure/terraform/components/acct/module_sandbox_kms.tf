module "kms_sandbox" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-kms.zip"

  count = var.support_sandbox_environments ? 1 : 0

  providers = {
    aws           = aws
    aws.us-east-1 = aws.us-east-1
  }

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region

  name                 = "sandbox"
  deletion_window      = var.kms_deletion_window
  alias                = "alias/${local.csi}-sandbox"
  key_policy_documents = [data.aws_iam_policy_document.kms_sandbox.json]
  iam_delegation       = true
}

data "aws_iam_policy_document" "kms_sandbox" {
  # '*' resource scope is permitted in access policies as as the resource is itself
  # https://docs.aws.amazon.com/kms/latest/developerguide/key-policy-services.html

  statement {
    sid    = "AllowCloudWatchEncrypt"
    effect = "Allow"

    principals {
      type = "Service"

      identifiers = [
        "logs.${var.region}.amazonaws.com"
      ]
    }

    actions = [
      "kms:Encrypt*",
      "kms:Decrypt*",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:Describe*"
    ]

    resources = [
      "*",
    ]

    condition {
      test     = "ArnLike"
      variable = "kms:EncryptionContext:aws:logs:arn"

      values = [
        "arn:aws:logs:${var.region}:${var.aws_account_id}:log-group:*",
      ]
    }
  }
}
