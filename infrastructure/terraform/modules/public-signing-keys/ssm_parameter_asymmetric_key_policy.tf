resource "aws_ssm_parameter" "asymmetric_key_policy" {
  name        = local.ssm_asymmetric_key_policy_name
  description = "The IAM policy applied to new asymmetric KMS keys used for CIS2 auth"
  type        = "String"
  value       = data.aws_iam_policy_document.asymmetric_key_policy.minified_json

  lifecycle {
    ignore_changes = [value]
  }
}

data "aws_iam_policy_document" "asymmetric_key_policy" {
  statement {
    sid    = "AllowRootFullAccess"
    effect = "Allow"

    actions = [
      "kms:*",
    ]

    resources = [
      "*"
    ]

    principals {
      type = "AWS"
      identifiers = [
        "arn:aws:iam::${var.aws_account_id}:root"
      ]
    }
  }

  statement {
    sid    = "AllowRotationLambdaAccess"
    effect = "Allow"

    actions = [
      "kms:Create*",
      "kms:DescribeKey",
      "kms:Get*",
      "kms:List*",
      "kms:Put*",
      "kms:ScheduleKeyDeletion"
    ]

    resources = [
      "*"
    ]

    principals {
      type = "AWS"
      identifiers = [
        module.lambda_jwks_key_rotation.iam_role_arn
      ]
    }
  }
}
