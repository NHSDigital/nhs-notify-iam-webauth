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
  type = string
  default = "userpool"
}

variable "stage" {
  type = string
  description = "The domain PTL stage (prod|nonprod)"
}

variable "app_url" {
  type = string
  description = "URL of web application used for auth callbacks"
}
