variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "ap-south-1" # Mumbai — change to your preferred region
}

variable "project_name" {
  description = "Name prefix for all resources (used in tags and naming)"
  type        = string
  default     = "brainbrush"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC (the IP range for your private network)"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet (a slice of the VPC)"
  type        = string
  default     = "10.0.1.0/24"
}

variable "availability_zone" {
  description = "The AZ to place the subnet in"
  type        = string
  default     = "ap-south-1a"
}

variable "instance_type" {
  description = "EC2 instance type (CPU + RAM combo)"
  type        = string
  default     = "t3.micro"
}

variable "ami_id" {
  description = "AMI ID for Ubuntu 22.04 LTS (changes per region!)"
  type        = string
  default     = ""
}

variable "key_pair_name" {
  description = "Name of the AWS key pair for SSH access"
  type        = string
}

variable "private_key_path" {
  description = "Local path to the private key .pem file (for Ansible SSH)"
  type        = string
  default     = "/home/xcaliber/Projects/brainbrush-key.pem"
}
