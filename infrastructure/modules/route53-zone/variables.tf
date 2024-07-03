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

variable "stage" {
  type        = string
  description = "The domain PTL stage (prod|nonprod)"
}
