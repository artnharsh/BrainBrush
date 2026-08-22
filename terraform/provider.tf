# ===========================================================================
# TERRAFORM PROVIDER CONFIGURATION
# ===========================================================================
# 
# 🎓 WHAT IS A PROVIDER?
# A "provider" is a plugin that lets Terraform talk to a cloud platform's API.
# Think of it like a database driver — you need the MySQL driver to talk to MySQL,
# and you need the AWS provider to talk to AWS.
#
# 🎓 WHAT IS terraform { required_providers }?
# This block pins the exact provider version so your infrastructure is reproducible.
# Without it, Terraform might download a newer version that breaks your config.
# ===========================================================================

terraform {
  required_version = ">= 1.0"       # Minimum Terraform CLI version

  required_providers {
    aws = {
      source  = "hashicorp/aws"      # Official AWS provider from HashiCorp
      version = "~> 5.0"             # Use version 5.x (any patch version)
      # ~> is the "pessimistic constraint" operator:
      #   ~> 5.0 means >= 5.0, < 6.0  (allows 5.1, 5.99, but NOT 6.0)
    }
  }
}

# ===========================================================================
# AWS PROVIDER CONFIGURATION
# ===========================================================================
#
# 🎓 HOW DOES TERRAFORM AUTHENTICATE WITH AWS?
# Terraform reads your AWS credentials in this priority order:
#   1. Environment variables: AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY
#   2. Shared credentials file: ~/.aws/credentials (created by `aws configure`)
#   3. IAM instance profile (if running on an EC2 instance)
#
# We use `var.aws_region` so the region is configurable, not hardcoded.
# ===========================================================================

provider "aws" {
  region = var.aws_region
  # No credentials here! They come from environment variables or ~/.aws/credentials
  # This is a security best practice — NEVER put credentials in code.
}
