resource "aws_iam_role" "ssm_automation_allocate_user" {
  name        = "${var.csi}-ssm-automation-allocate-user"
  description = "Execution role for SSM Automation document that allocates users to clients"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ssm.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_policy" "ssm_automation_allocate_user" {
  name        = "${var.csi}-ssm-automation-allocate-user"
  description = "Permissions for SSM Automation to allocate users to clients"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "CognitoUserReadAccess"
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminGetUser"
        ]
        Resource = "arn:aws:cognito-idp:${var.region}:${var.aws_account_id}:userpool/${var.user_pool_id}"
      },
      {
        Sid    = "CognitoUserWriteAccess"
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminUpdateUserAttributes"
        ]
        Resource = "arn:aws:cognito-idp:${var.region}:${var.aws_account_id}:userpool/${var.user_pool_id}"
      },
      {
        Sid    = "DynamoDBWriteAccess"
        Effect = "Allow"
        Action = [
          "dynamodb:ConditionCheckItem",
          "dynamodb:PutItem",
          "dynamodb:TransactWriteItems"
        ]
        Resource = aws_dynamodb_table.users.arn
      },
      {
        Sid    = "KMSAccessForDynamoDBEncryption"
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey",
          "kms:Encrypt",
          "kms:GenerateDataKey*",
          "kms:ReEncrypt*"
        ]
        Resource = var.kms_key_arn
      },
      {
        Sid    = "SSMClientParameterReadAccess"
        Effect = "Allow"
        Action = [
          "ssm:GetParameter"
        ]
        Resource = "arn:aws:ssm:${var.region}:${var.aws_account_id}:parameter/${var.csi}/clients/*"
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_automation_allocate_user" {
  role       = aws_iam_role.ssm_automation_allocate_user.name
  policy_arn = aws_iam_policy.ssm_automation_allocate_user.arn
}
