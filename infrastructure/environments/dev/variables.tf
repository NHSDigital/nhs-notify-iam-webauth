variable "domain" {
  type    = string
  default = "iam"
}

variable "group" {
  type    = string
  default = "nonprod"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "component" {
  type    = string
  default = "auth"
}

variable "github_pat" {
  default     = "NOT-SET"
  description = "GitHub Personal Access Token used to initialise a new Amplify app"
}

variable "repository" {
  type    = string
  default = "https://github.com/NHSDigital/nhs-notify-iam-webauth"
}

variable "branch" {
  type    = string
  default = "main"
}
