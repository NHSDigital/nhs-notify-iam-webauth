terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
    github = {
      source  = "integrations/github"
      version = "= 6.8.1"
    }
  }

  required_version = ">= 1.10.1"
}
