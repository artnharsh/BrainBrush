# ===========================================================================
# TERRAFORM VARIABLES
# ===========================================================================
#
# 🎓 WHAT ARE VARIABLES IN TERRAFORM?
# Variables make your infrastructure REUSABLE and CONFIGURABLE.
# Instead of hardcoding "us-east-1" everywhere, you define a variable
# and reference it as `var.aws_region`. This way:
#   - Different environments (dev/staging/prod) can use different values
#   - Team members can customize without changing code
#   - Sensitive values (like key names) stay out of version control
#
# 🎓 HOW DO VARIABLES GET THEIR VALUES?
# Terraform checks in this order (last one wins):
#   1. `default` value in the variable block (lowest priority)
#   2. terraform.tfvars file
#   3. Environment variables: TF_VAR_<name>  (e.g., TF_VAR_aws_region)
#   4. Command line: terraform apply -var="aws_region=us-west-2"
# ===========================================================================


# ---------------------------------------------------------------------------
# AWS Configuration
# ---------------------------------------------------------------------------

variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "ap-south-1"    # Mumbai — change to your preferred region
  # 💡 Common regions: us-east-1 (Virginia), eu-west-1 (Ireland), ap-south-1 (Mumbai)
}

variable "project_name" {
  description = "Name prefix for all resources (used in tags and naming)"
  type        = string
  default     = "brainbrush"
}


# ---------------------------------------------------------------------------
# VPC & Networking
# ---------------------------------------------------------------------------

variable "vpc_cidr" {
  description = "CIDR block for the VPC (the IP range for your private network)"
  type        = string
  default     = "10.0.0.0/16"
  # 🎓 WHAT IS A CIDR BLOCK?
  # It defines a range of IP addresses. "10.0.0.0/16" means:
  #   - Network starts at 10.0.0.0
  #   - /16 = first 16 bits are fixed, leaving 65,536 addresses (10.0.0.0 - 10.0.255.255)
  # Think of it as: "this VPC can have up to 65K devices"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet (a slice of the VPC)"
  type        = string
  default     = "10.0.1.0/24"
  # /24 = 256 addresses (10.0.1.0 - 10.0.1.255). Plenty for our use case.
}

variable "availability_zone" {
  description = "The AZ to place the subnet in"
  type        = string
  default     = "ap-south-1a"
  # 🎓 WHAT IS AN AVAILABILITY ZONE (AZ)?
  # Each AWS region has multiple isolated data centers called AZs.
  # ap-south-1a, ap-south-1b, ap-south-1c are 3 separate buildings in Mumbai.
  # For production, you'd spread across multiple AZs for fault tolerance.
}


# ---------------------------------------------------------------------------
# EC2 Instance
# ---------------------------------------------------------------------------

variable "instance_type" {
  description = "EC2 instance type (CPU + RAM combo)"
  type        = string
  default     = "t2.medium"
  # 🎓 INSTANCE TYPE CHEAT SHEET:
  #   t2.micro  = 1 vCPU, 1GB RAM  (free tier eligible, too small for our app)
  #   t2.small  = 1 vCPU, 2GB RAM  (borderline)
  #   t2.medium = 2 vCPU, 4GB RAM  (good for Docker + our app) ✅
  #   t2.large  = 2 vCPU, 8GB RAM  (overkill for learning)
}

variable "ami_id" {
  description = "AMI ID for Ubuntu 22.04 LTS (changes per region!)"
  type        = string
  default     = ""
  # 🎓 WHAT IS AN AMI?
  # Amazon Machine Image — it's the "operating system template" for your VM.
  # Think of it like a Docker image but for entire VMs.
  # If left empty, we'll automatically find the latest Ubuntu 22.04 AMI.
}

variable "key_pair_name" {
  description = "Name of the AWS key pair for SSH access"
  type        = string
  # 🎓 WHAT IS A KEY PAIR?
  # AWS uses SSH key pairs instead of passwords for EC2 access.
  # You create a key pair in the AWS Console → EC2 → Key Pairs.
  # AWS stores the public key; you download the private key (.pem file).
  # Ansible will use this .pem file to SSH into the instance.
  #
  # ⚠️ No default — you MUST provide this in terraform.tfvars
}

variable "private_key_path" {
  description = "Local path to the private key .pem file (for Ansible SSH)"
  type        = string
  default     = "/home/xcaliber/Projects/brainbrush-key.pem"
  # This is the .pem file you downloaded when creating the key pair.
}
