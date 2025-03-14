variable "description" {
  type        = string
  description = "Description of what your Lambda Function does"
}

variable "filename" {
  type        = string
  description = "Path to the function's deployment package within the local filesystem"
}

variable "function_name" {
  type        = string
  description = "Unique name of the Lambda function"
}

variable "source_code_hash" {
  type        = string
  description = "Base64-encoded SHA256 hash of the package file specified by `filename`"
}

variable "handler" {
  type        = string
  description = "Function entrypoint in your code"
}

variable "runtime" {
  type        = string
  description = "Identifier of the function's runtime"
  default     = "nodejs20.x"
}

variable "log_retention_in_days" {
  type        = number
  description = "Specifies the number of days you want to retain log events in the log group for this Lambda"
  default     = 0
}

variable "environment_variables" {
  type        = map(string)
  description = "Lambda environment variables"
  default     = {}
}

variable "resource_policies" {
  type = map(object({
    statement_id   = optional(string)
    action         = string
    principal      = string
    source_arn     = optional(string)
    source_account = optional(string)
  }))
  description = ""
  default     = {}
}

variable "execution_role_policy_document" {
  type        = string
  description = "IAM Policy Document containing additional runtime permissions for the Lambda function beyond the basic execution policy"
  default     = ""
}
