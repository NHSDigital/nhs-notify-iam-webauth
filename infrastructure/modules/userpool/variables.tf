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
  default = "userpool"
}

variable "group" {
  type        = string
  description = "The domain PTL group (prod|nonprod)"
}

variable "app_url" {
  type        = string
  description = "URL of web application used for auth callbacks"
}
