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
  default     = "iam"
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

variable "root_domain_name" {
  type        = string
  description = "The service's root DNS root nameespace, like nonprod.nhsnotify.national.nhs.uk"
  default     = "nonprod.nhsnotify.national.nhs.uk"
}

variable "enable_amplify_branch_auto_build" {
  type = bool
  description = "Enable automatic building of branches"
  default = false
}

variable "cognito_user_pool_additional_callback_urls" {
  type = list(string)
  description = "A list of additional callback_urls for the cognito user pool"
  default = []
}

variable "enable_cognito_built_in_idp" {
  type = bool
  description = "Enable the use of Cognito as an IDP; CIS2 is prefered"
  default = false
}
