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

variable "component" {
  type        = string
  description = "The variable encapsulating the name of this component"
  default     = "api"
}

##
# Variables specific to this component
##

variable "csi" {
  type        = string
  description = "CSI from the parent component"
}

variable "log_retention_in_days" {
  type        = number
  description = "The retention period in days for the Cloudwatch Logs events to be retained, default of 0 is indefinite"
  default     = 0
}

variable "cis2_url" {
  type        = string
  description = "CSI from the parent component"
}

variable "cis2_auth_mode" {
  type        = string
  description = "The authentication mode used between NHS Notify and CIS2"

  validation {
    condition     = contains(["client_secret", "jwks"], var.cis2_auth_mode)
    error_message = "Allowed values for cis2_auth_mode are \"client_secret\" or \"jwks\"."
  }
}

variable "ssm_key_directory_name" {
  type        = string
  description = "An array of KMS signing keys in rotation used for CIS2 authentication"
}

variable "filter_pattern" {
  type        = string
  description = "Filter pattern to use for the log subscription filter"
  default     = ""
}

variable "log_destination_arn" {
  type        = string
  description = "Destination ARN to use for the log subscription filter"
  default     = ""
}

variable "log_subscription_role_arn" {
  type        = string
  description = "The ARN of the IAM role to use for the log subscription filter"
  default     = ""
}

variable "kms_key_arn" {
  type        = string
  description = "KMS key ARN"
}

variable "function_s3_bucket" {
  type        = string
  description = "Name of S3 bucket to upload lambda artefacts to"
}
