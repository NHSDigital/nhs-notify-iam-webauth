variable "domain" {
  type = string
}

variable "environment" {
  type = string
}

variable "component" {
  type = string
}

variable "module" {
  type    = string
  default = "branch"
}

variable "stage" {
  type        = string
  description = "The domain PTL stage (prod|nonprod)"
}

variable "cognito_user_pool_id" {
  type = string
}

variable "cognito_user_pool_identity_provider_names" {
  type = list(string)
}

variable "amplify_app_id" {
  type = string
}

variable "branch" {
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
