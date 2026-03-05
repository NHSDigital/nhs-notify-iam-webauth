data "aws_iam_policy_document" "ssm_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ssm.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ssm_automation_allocate_user" {
  name        = "${var.csi}-ssm-automation-allocate-user"
  description = "Execution role for SSM Automation document that allocates users to clients"

  assume_role_policy = data.aws_iam_policy_document.ssm_assume_role.json
}

data "aws_iam_policy_document" "ssm_automation_allocate_user" {
  statement {
    sid     = "CognitoUserReadAccess"
    effect  = "Allow"
    actions = ["cognito-idp:AdminGetUser"]
    resources = [
      "arn:aws:cognito-idp:${var.region}:${var.aws_account_id}:userpool/${var.user_pool_id}"
    ]
  }

  statement {
    sid     = "CognitoUserWriteAccess"
    effect  = "Allow"
    actions = ["cognito-idp:AdminUpdateUserAttributes"]
    resources = [
      "arn:aws:cognito-idp:${var.region}:${var.aws_account_id}:userpool/${var.user_pool_id}"
    ]
  }

  statement {
    sid    = "DynamoDBWriteAccess"
    effect = "Allow"
    actions = [
      "dynamodb:ConditionCheckItem",
      "dynamodb:PutItem",
      "dynamodb:TransactWriteItems",
    ]
    resources = [aws_dynamodb_table.users.arn]
  }

  statement {
    sid    = "KMSAccessForDynamoDBEncryption"
    effect = "Allow"
    actions = [
      "kms:Decrypt",
      "kms:DescribeKey",
      "kms:Encrypt",
      "kms:GenerateDataKey*",
      "kms:ReEncrypt*",
    ]
    resources = [var.kms_key_arn]
  }

  statement {
    sid     = "SSMClientParameterReadAccess"
    effect  = "Allow"
    actions = ["ssm:GetParameter"]
    resources = [
      "arn:aws:ssm:${var.region}:${var.aws_account_id}:parameter/${var.csi}/clients/*"
    ]
  }
}


resource "aws_iam_policy" "ssm_automation_allocate_user" {
  name        = "${var.csi}-ssm-automation-allocate-user"
  description = "Permissions for SSM Automation to allocate users to clients"

  policy = data.aws_iam_policy_document.ssm_automation_allocate_user.json
}

resource "aws_iam_role_policy_attachment" "ssm_automation_allocate_user" {
  role       = aws_iam_role.ssm_automation_allocate_user.name
  policy_arn = aws_iam_policy.ssm_automation_allocate_user.arn
}
