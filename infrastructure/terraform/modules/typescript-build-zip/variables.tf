variable "source_code_dir" {
  type        = string
  description = "Path to the root directory of the TypeScript project to build"
}

variable "entrypoints" {
  type        = list(string)
  description = "Entrypoint filenames (relative to source_code_dir)"

  validation {
    condition     = alltrue([for e in var.entrypoints : endswith(e, ".ts")])
    error_message = "Entrypoint must be a TypeScript file with .ts extension"
  }
}

variable "output_dir" {
  type        = string
  description = "Name of the build output directory (relative to source_code_dir)"
  default     = "dist"
}
