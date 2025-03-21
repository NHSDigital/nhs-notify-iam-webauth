terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"

      configuration_aliases = [
        aws.eu-west-2,
        aws.us-east-1,
      ]
    }
  }

  required_version = ">= 1.9.2"
}
