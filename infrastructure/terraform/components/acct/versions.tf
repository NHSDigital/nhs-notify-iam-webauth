terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
  }

  required_version = ">= 1.8.1, < 1.9.0"
}
