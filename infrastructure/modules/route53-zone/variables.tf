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
  default = "r53"
}

variable "group" {
  type        = string
  description = "The domain PTL group (prod|nonprod)"
}
