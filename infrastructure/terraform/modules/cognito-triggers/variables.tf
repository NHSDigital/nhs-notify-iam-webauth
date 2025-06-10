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
  default     = "cog"
}

##
# Variables specific to this component
##

variable "log_retention_in_days" {
  type        = number
  description = "The retention period in days for the Cloudwatch Logs events to be retained, default of 0 is indefinite"
  default     = 0
}

variable "kms_key_arn" {
  type        = string
  description = "KMS key ARN"
}

variable "function_s3_bucket" {
  type        = string
  description = "Name of S3 bucket to upload lambda artefacts to"
}

variable "user_pool_id" {
  type        = string
  description = "ID of the Cognito user pool the triggers should be applied to"
}

variable "client_config_parameter_path_prefix" {
  type        = string
  description = "Path prefix of SSM parameters where client configs are stored. The prefix will have the client id appended to it to form a complete parameter path."
}
