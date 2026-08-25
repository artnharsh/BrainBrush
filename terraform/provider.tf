terraform {
  required_version = ">= 1.0" # Minimum Terraform CLI version

  required_providers {
    aws = {
      source  = "hashicorp/aws" # Official AWS provider from HashiCorp
      version = "~> 5.0"        # Use version 5.x (any patch version)
    }
  }
}

provider "aws" {
  region = var.aws_region
}
