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

variable "component" {
  type        = string
  description = "The name of the tfscaffold component"
}

variable "module" {
  type        = string
  description = "The variable encapsulating the name of this module"
  default     = "psk"
}

variable "aws_account_id" {
  type        = string
  description = "The AWS Account ID (numeric)"
}

variable "region" {
  type        = string
  description = "The AWS Region"
}

##
# tfscaffold variables specific to this component
##

# This is the only primary variable to have its value defined as
# a default within its declaration in this file, because the variables
# purpose is as an identifier unique to this component, rather
# then to the environment from where all other variables come.

variable "default_tags" {
  type        = map(string)
  description = "A map of default tags to apply to all taggable resources within the component"
  default     = {}
}

variable "enable_github_actions_ip_access" {
  type        = bool
  description = "Should the Github actions runner IP addresses be permitted access to this distribution. This should not be enabled in production environments"
  default     = false
}

variable "waf_rate_limit_cdn" {
  type        = number
  description = "The rate limit is the maximum number of CDN requests from a single IP address that are allowed in a five-minute period"
  default     = 20000
}

variable "s3_access_logs_bucket_id" {
  type = string
  description = "S3 bucket ID for Access Logs"
}

variable "dns_zone_id" {
  type = string
  description = "The base DNS zone ID"
}
