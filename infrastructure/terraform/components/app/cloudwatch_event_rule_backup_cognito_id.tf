
resource "aws_cloudwatch_event_rule" "backup_cognito_id" {
  count = var.destination_vault_arn != null ? 1 : 0

  name        = "${local.csi}-backup-cognito-id"
  description = "Rule to catch Cognito user attribute actions"
  event_pattern = jsonencode({
    "source" : ["aws.cognito-idp"],
    "detail-type" : ["AWS API Call via CloudTrail"],
    "detail" : {
      "requestParameters" : {
        "userPoolId" : ["${aws_cognito_user_pool.main.id}"]
      },
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
        "OAuth2_Authorize_GET",
        "RespondToAuthChallenge",
        "SetUserSettings",
        "UpdateUserAttributes",
        "VerifyUserAttribute",
      ]
    }
  })
}
