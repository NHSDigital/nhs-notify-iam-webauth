terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
    github = {
      source  = "hashicorp/github"
      version = "= 6.8.0"
    }
  }

  required_version = ">= 1.10.1"
}
