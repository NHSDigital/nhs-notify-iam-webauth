terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.55.0"
    }

    awscc = {
      source  = "hashicorp/awscc"
      version = "0.74.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "3.4.2"
    }
  }

  required_version = ">= 1.3.0"
}
