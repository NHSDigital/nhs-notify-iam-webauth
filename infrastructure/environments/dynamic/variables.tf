variable "domain" {
  type    = string
  default = "iam"
}

variable "stage" {
  type    = string
  default = "nonprod"
}

variable "environment" {
  type    = string
  default = "dynamic"
}

variable "component" {
  type    = string
  default = "auth"
}

variable "branch" {
  type    = string
  default = "custom-branch" # currently ignored
}
