##
# Basic Required Variables for tfscaffold Components
##

variable "project" {
  type        = string
  description = "The name of the tfscaffold project"
}

variable "environment" {
  type        = string
  description = "The name of the tfscaffold environment"
}

variable "aws_account_id" {
  type        = string
  description = "The AWS Account ID (numeric)"
}

variable "region" {
  type        = string
  description = "The AWS Region"
}

variable "group" {
  type        = string
  description = "The group variables are being inherited from (often synonmous with account short-name)"
}

##
# tfscaffold variables specific to this component
##

# This is the only primary variable to have its value defined as
# a default within its declaration in this file, because the variables
# purpose is as an identifier unique to this component, rather
# then to the environment from where all other variables come.
variable "component" {
  type        = string
  description = "The variable encapsulating the name of this component"
  default     = "app"
}

variable "default_tags" {
  type        = map(string)
  description = "A map of default tags to apply to all taggable resources within the component"
  default     = {}
}

##
# Variables specific to the "dnsroot"component
##

variable "log_retention_in_days" {
  type        = number
  description = "The retention period in days for the Cloudwatch Logs events to be retained, default of 0 is indefinite"
  default     = 0
}

variable "kms_deletion_window" {
  type        = string
  description = "When a kms key is deleted, how long should it wait in the pending deletion state?"
  default     = "30"
}

variable "parent_acct_environment" {
  type        = string
  description = "Name of the environment responsible for the acct resources used, affects things like DNS zone. Useful for named dev environments"
  default     = "main"
}

variable "enable_amplify_branch_auto_build" {
  type        = bool
  description = "Enable automatic building of branches"
  default     = false
}

variable "cognito_user_pool_additional_callback_urls" {
  type        = list(string)
  description = "A list of additional callback_urls for the cognito user pool"
  default     = []
}

variable "cognito_user_pool_additional_logout_urls" {
  type        = list(string)
  description = "A list of additional logout_urls for the cognito user pool"
  default     = []
}

variable "cognito_prevent_deletion" {
  type        = bool
  description = "Prevents accidental deletion of the cognito user pool"
  default     = true
}

variable "cognito_user_pool_use_environment_specific_gateway_callback_url" {
  type        = bool
  description = "Enable an environment specific web gateway callback URL - for use in environments that are using dynamic domains"
  default     = false
}

variable "cognito_user_pool_environment_specific_gateway_callback_url_suffix" {
  type        = string
  description = "The suffix for the environment specific web gateway callback URL - should be prefixed with with protocol and environment name"
  default     = ""
}

variable "cognito_user_pool_environment_specific_gateway_logout_url_suffix" {
  type        = string
  description = "The suffix for the environment specific web gateway logout callback URL - should be prefixed with with protocol and environment name"
  default     = ""
}

variable "enable_cognito_built_in_idp" {
  type        = bool
  description = "Enable the use of Cognito as an IDP; CIS2 is preferred"
  default     = false
}

variable "enable_amplify_basic_auth" {
  type        = bool
  description = "Enable a basic set of credentials in the form of a dynamically generated username and password for the amplify app branches. Not intended for production use"
  default     = true
}

variable "AMPLIFY_BASIC_AUTH_SECRET" {
  # Github only does uppercase env vars
  type        = string
  description = "Secret key/password to use for Amplify Basic Auth - This is entended to be read from CI variables and not commited to any codebase"
  default     = "unset"
}

variable "CSRF_SECRET" {
  # Github only does uppercase env vars
  type        = string
  description = "Secure cryptographic key to be used for generating CSRF tokens - This is entended to be read from CI variables and not commited to any codebase"
  default     = "unset"
}

variable "branch_name" {
  type        = string
  description = "The branch name to deploy"
  default     = "main"
}

variable "url_prefix" {
  type        = string
  description = "The url prefix to use for the deployed branch"
  default     = "main"
}

variable "commit_id" {
  type        = string
  description = "The commit to deploy. Must be in the tree for branch_name"
  default     = "HEAD"
}

variable "disable_content" {
  type        = string
  description = "Value for turning switching disable content true/false"
  default     = "false"
}

variable "enable_cis2_idp" {
  type        = bool
  description = "Switch to enable the CIS2 Cognito federation"
  default     = true
}

variable "cis2_environment" {
  type        = string
  description = "Name of the CIS2 environment, e.g. mock, int, live. See: https://digital.nhs.uk/services/care-identity-service/applications-and-services/cis2-authentication/guidance-for-developers/detailed-guidance/registration"
  default     = ""

  validation {
    condition     = contains(["int", "live"], var.cis2_environment)
    error_message = "Allowed values for cis2_environment are \"int\" or \"live\"."
  }
}
