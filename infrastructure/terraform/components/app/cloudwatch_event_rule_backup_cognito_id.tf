
resource "aws_cloudwatch_event_rule" "backup_cognito_id" {
  count = var.destination_vault_arn != null ? 1 : 0

  name        = "${local.csi}-backup-cognito-id"
  description = "Rule to catch Cognito user attribute actions"
  event_pattern = jsonencode({
    "source" : ["aws.cognito-idp"],
    "detail-type" : ["AWS API Call via CloudTrail"],
    "detail" : {
      "eventSource": ["cognito-idp.amazonaws.com"],
      "eventName" : [
        "AddCustomAttributes",
        "AdminAddUserToGroup",
        "AdminConfirmSignUp",
        "AdminCreateUser",
        "AdminDeleteUser",
        "AdminDeleteUserAttributes",
        "AdminDisableUser",
        "AdminEnableUser",
        "AdminRemoveUserFromGroup",
        "AdminSetUserSettings",
        "AdminUpdateUserAttributes",
        "DeleteUserAttributes",
        "RespondToAuthChallenge",
        "SetUserSettings",
        "UpdateUserAttributes",
        "VerifyUserAttribute",
      ]
    }
  })
}

resource "aws_cloudwatch_event_rule" "backup_cognito_id_oauth" {
  count = var.destination_vault_arn != null ? 1 : 0

  name        = "${local.csi}-backup-cognito-oauth-id"
  description = "Rule to catch Cognito user OAuth attribute actions"
  event_pattern = jsonencode({
    "source" : ["aws.cognito-idp"],
    "detail-type" : ["AWS Service Event via CloudTrail"],
    "detail" : {
      "additionalEventData" : {
        "userPoolId" : ["${aws_cognito_user_pool.main.id}"]
      },
      "eventSource": ["cognito-idp.amazonaws.com"],
      "eventName" : [
        "OAuth2_Authorize_GET"
      ]
    }
  })
}
