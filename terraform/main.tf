# ===========================================================================
# MAIN INFRASTRUCTURE — THE CORE OF YOUR AWS SETUP
# ===========================================================================
#
# 🎓 HOW TO READ THIS FILE:
# Terraform files are DECLARATIVE, not procedural.
# You're describing WHAT you want, not step-by-step HOW to create it.
# Terraform figures out the correct order automatically.
#
# For example, it knows a Subnet needs a VPC first, so it creates the VPC
# before the Subnet — you don't need to specify the order!
#
# 🎓 RESOURCE SYNTAX:
#   resource "<provider>_<type>" "<your_local_name>" {
#     property = value
#   }
#
# The local name (e.g., "brainbrush_vpc") is how YOU refer to this resource
# elsewhere in your Terraform code. It's NOT the name in AWS.
# ===========================================================================


# ===========================================================================
# DATA SOURCE: Find the latest Ubuntu 22.04 AMI automatically
# ===========================================================================
#
# 🎓 WHAT IS A DATA SOURCE?
# A data source READS information from AWS without creating anything.
# Here, we ask AWS: "What's the latest Ubuntu 22.04 AMI in my region?"
# This way, you don't need to hardcode AMI IDs (which change per region).
# ===========================================================================

data "aws_ami" "ubuntu" {
  most_recent = true                    # Get the newest matching AMI
  owners      = ["099720109477"]        # Canonical's AWS account ID (Ubuntu publisher)

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
    # 🔍 This pattern matches: Ubuntu 22.04 (Jammy), 64-bit, SSD-backed
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
    # HVM = Hardware Virtual Machine (modern, better performance)
  }
}


# ===========================================================================
# VPC (Virtual Private Cloud) — Your own private network in AWS
# ===========================================================================
#
# 🎓 WHAT IS A VPC?
# Imagine you rented a floor in an office building (AWS region).
# A VPC is like putting up walls to create YOUR private office space.
# Nothing can get in or out unless you explicitly allow it.
#
# Without a VPC, your EC2 instance would be on a shared network — bad for security!
# ===========================================================================

resource "aws_vpc" "brainbrush_vpc" {
  cidr_block           = var.vpc_cidr               # IP range: 10.0.0.0/16
  enable_dns_support   = true                        # Allow DNS resolution inside VPC
  enable_dns_hostnames = true                        # Give instances DNS hostnames

  tags = {
    Name = "${var.project_name}-vpc"                 # Shows as "brainbrush-vpc" in AWS Console
  }
}


# ===========================================================================
# INTERNET GATEWAY — The door between your VPC and the internet
# ===========================================================================
#
# 🎓 WHAT IS AN INTERNET GATEWAY?
# A VPC is isolated by default — no internet access in or out.
# An Internet Gateway (IGW) is like installing a front door.
# Without it, nobody can reach your website, and your server can't
# download Docker images or npm packages.
# ===========================================================================

resource "aws_internet_gateway" "brainbrush_igw" {
  vpc_id = aws_vpc.brainbrush_vpc.id    # Attach to our VPC

  tags = {
    Name = "${var.project_name}-igw"
  }
}


# ===========================================================================
# PUBLIC SUBNET — A section of your VPC that CAN talk to the internet
# ===========================================================================
#
# 🎓 WHAT IS A SUBNET?
# A subnet is a subdivision of your VPC's IP range.
# "Public" means instances here CAN get public IPs and reach the internet.
# "Private" subnets (not used here) are for databases and internal services.
#
# Our VPC has 65K IPs (10.0.0.0/16). This subnet uses 256 of them (10.0.1.0/24).
# ===========================================================================

resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.brainbrush_vpc.id
  cidr_block              = var.public_subnet_cidr       # 10.0.1.0/24
  availability_zone       = var.availability_zone         # ap-south-1a
  map_public_ip_on_launch = true                          # Auto-assign public IPs!
  # ☝️ This is crucial — without it, your EC2 instance won't get a public IP

  tags = {
    Name = "${var.project_name}-public-subnet"
  }
}


# ===========================================================================
# ROUTE TABLE — Traffic rules: "how does network traffic flow?"
# ===========================================================================
#
# 🎓 WHAT IS A ROUTE TABLE?
# It's like a map that tells your VPC: "If traffic is going to X, send it via Y."
# We need a rule that says: "For any traffic going to the internet (0.0.0.0/0),
# send it through the Internet Gateway."
#
# Without this, even with an IGW, traffic wouldn't know where to go!
# ===========================================================================

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.brainbrush_vpc.id

  route {
    cidr_block = "0.0.0.0/0"                             # ALL traffic (the entire internet)
    gateway_id = aws_internet_gateway.brainbrush_igw.id   # → goes through the Internet Gateway
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

# Associate the route table with our subnet
# (A subnet without a route table association uses the VPC's default — which has NO internet route)
resource "aws_route_table_association" "public_rta" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}


# ===========================================================================
# SECURITY GROUP — The firewall rules for your EC2 instance
# ===========================================================================
#
# 🎓 WHAT IS A SECURITY GROUP?
# Think of it as a bouncer at a club with two lists:
#   - INGRESS (inbound): Who can come IN to your server?
#   - EGRESS (outbound): What can your server reach OUT to?
#
# By default, AWS blocks ALL inbound traffic and allows ALL outbound.
# We need to open specific ports for our app to work.
# ===========================================================================

resource "aws_security_group" "brainbrush_sg" {
  name        = "${var.project_name}-sg"
  description = "Security group for BrainBrush - allows HTTP, HTTPS, backend API, and SSH"
  vpc_id      = aws_vpc.brainbrush_vpc.id

  # -----------------------------------------------------------------------
  # INGRESS RULES (Inbound — who can reach our server?)
  # -----------------------------------------------------------------------

  # Port 22: SSH — so Ansible (and you) can connect to configure the server
  ingress {
    description = "SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]   # Open to all IPs (for learning; in prod, restrict to your IP)
    # ⚠️ PRODUCTION TIP: Replace with your IP, e.g., ["203.0.113.50/32"]
  }

  # Port 80: HTTP — so users can access the frontend (Nginx)
  ingress {
    description = "HTTP traffic (frontend)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]   # Open to the world ✅
  }

  # Port 443: HTTPS — for future SSL/TLS setup
  ingress {
    description = "HTTPS traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Port 5000: Backend API — so the frontend can talk to Express/Socket.IO
  ingress {
    description = "Backend API (Express + Socket.IO)"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Port 8080: Jenkins Web UI (only needed if running Jenkins on this same server)
  ingress {
    description = "Jenkins Web UI"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # -----------------------------------------------------------------------
  # EGRESS RULES (Outbound — what can our server reach?)
  # -----------------------------------------------------------------------

  # Allow ALL outbound traffic (server needs to download Docker images, npm packages, etc.)
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"              # "-1" means ALL protocols
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg"
  }
}


# ===========================================================================
# EC2 INSTANCE — Your actual server (virtual machine)
# ===========================================================================
#
# 🎓 WHAT IS AN EC2 INSTANCE?
# EC2 = Elastic Compute Cloud. It's a virtual machine running in AWS.
# Think of it as renting a computer in Amazon's data center.
# You choose:
#   - The OS (AMI) → Ubuntu 22.04
#   - The size (instance type) → t2.medium (2 CPU, 4GB RAM)
#   - The network (VPC + subnet + security group) → our custom setup above
#   - The SSH key → for remote access
# ===========================================================================

resource "aws_instance" "brainbrush_server" {
  # Which OS to install (Ubuntu 22.04, found automatically by our data source)
  ami = var.ami_id != "" ? var.ami_id : data.aws_ami.ubuntu.id
  # ☝️ This is a ternary: if ami_id is provided, use it; otherwise, use the auto-found one

  instance_type = var.instance_type                      # t2.medium
  subnet_id     = aws_subnet.public_subnet.id            # Put it in our public subnet

  vpc_security_group_ids = [aws_security_group.brainbrush_sg.id]  # Apply our firewall rules

  key_name = var.key_pair_name                            # SSH key for access

  # Root disk — 20GB is comfortable for Docker images + app
  root_block_device {
    volume_size = 20          # GB
    volume_type = "gp3"       # General Purpose SSD (good balance of cost + speed)
    # 🎓 VOLUME TYPES:
    #   gp3 = General Purpose SSD (baseline 3000 IOPS, cheapest SSD option) ✅
    #   gp2 = Older General Purpose SSD (IOPS scales with size)
    #   io1 = Provisioned IOPS (expensive, for databases)
  }

  # Tags are metadata labels — they show up in the AWS Console
  tags = {
    Name        = "${var.project_name}-server"
    Environment = "production"
    ManagedBy   = "terraform"
    # 💡 The "ManagedBy = terraform" tag is a convention to remind you:
    # "Don't modify this resource manually in the console — change the code instead!"
  }
}
