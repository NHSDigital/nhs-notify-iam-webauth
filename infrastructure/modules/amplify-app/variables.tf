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
  default = "app"
}

variable "stage" {
  type = string
  description = "The domain PTL stage (prod|nonprod)"
}

variable "cognito_user_pool_id" {
  type = string
}

variable "cognito_hosted_login_domain" {
  type = string
  description = "The domain assigned to the cognito user pool to handle login callbacks"
}

variable "repository" {
  type = string
}

variable "domain_name" {
  type        = string
  description = "Root domain name for this Amplify app"
}

variable "github_pat" {
  type = string
  description = "GitHub Personal Access Token used to initialise a new Amplify app"
}
