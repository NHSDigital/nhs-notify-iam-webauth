##
# Basic inherited variables for terraformscaffold modules
##

variable "project" {
  type        = string
  description = "The name of the terraformscaffold project calling the module"
}

variable "environment" {
  type        = string
  description = "The name of the terraformscaffold environment the module is called for"
}

variable "component" {
  type        = string
  description = "The name of the terraformscaffold component calling this module"
}

variable "aws_account_id" {
  type        = string
  description = "The AWS Account ID (numeric)"
}

variable "group" {
  type        = string
  description = "The group variables are being inherited from (often synonmous with account short-name)"
}

##
# Module self-identification
##

variable "module" {
  type        = string
  description = "The name of this module. This is a special variable, it should be set only here and never overridden."
  default     = "kms"
}

##
# Variable specific to the module
##

# We presume this will always be specified. The default of {} will cause an error if a valid map is not specified.
# If we ever want to define this but allow it to not be specified, then we must provide a default tag keypair will be applied
# as the true default. In any other case default_tags should be removed from the module.
variable "default_tags" {
  type        = map(string)
  description = "Default tag map for application to all taggable resources in the module"
  default     = {}
}

variable "region" {
  type        = string
  description = "The AWS Region"
}

variable "name" {
  type        = string
  description = "A unique name to distinguish this module invocation from others within the same CSI scope"
}

variable "cognito_user_pool_client_id" {
  description = "Cognito User Pool client ID"
  type = string
}

variable "cognito_user_pool_identity_provider_names" {
  description = "A list of Cognito IDP names"
  type = list(string)
}

variable "amplify_app_id" {
  description = "Amplify application ID"
  type = string
}

variable "branch" {
  description = "The name of the branch being deployed"
  type = string
}

variable "domain_name" {
  type        = string
  description = "Root domain name for this Amplify app"
}

variable "subdomain" {
  type        = string
  default     = "main"
  description = "Subdomain used as the branch alias"
}