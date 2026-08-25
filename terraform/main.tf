data "aws_ami" "ubuntu" {
  most_recent = true             # Get the newest matching AMI
  owners      = ["099720109477"] # Canonical's AWS account ID (Ubuntu publisher)

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_vpc" "brainbrush_vpc" {
  cidr_block           = var.vpc_cidr # IP range: 10.0.0.0/16
  enable_dns_support   = true         # Allow DNS resolution inside VPC
  enable_dns_hostnames = true         # Give instances DNS hostnames

  tags = {
    Name = "${var.project_name}-vpc" # Shows as "brainbrush-vpc" in AWS Console
  }
}

resource "aws_internet_gateway" "brainbrush_igw" {
  vpc_id = aws_vpc.brainbrush_vpc.id # Attach to our VPC

  tags = {
    Name = "${var.project_name}-igw"
  }
}

resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.brainbrush_vpc.id
  cidr_block              = var.public_subnet_cidr # 10.0.1.0/24
  availability_zone       = var.availability_zone  # ap-south-1a
  map_public_ip_on_launch = true                   # Auto-assign public IPs!

  tags = {
    Name = "${var.project_name}-public-subnet"
  }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.brainbrush_vpc.id

  route {
    cidr_block = "0.0.0.0/0"                            # ALL traffic (the entire internet)
    gateway_id = aws_internet_gateway.brainbrush_igw.id # → goes through the Internet Gateway
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

resource "aws_route_table_association" "public_rta" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_security_group" "brainbrush_sg" {
  name        = "${var.project_name}-sg"
  description = "Security group for BrainBrush - allows HTTP, HTTPS, backend API, and SSH"
  vpc_id      = aws_vpc.brainbrush_vpc.id

  ingress {
    description = "SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Open to all IPs (for learning; in prod, restrict to your IP)
  }

  ingress {
    description = "HTTP traffic (frontend)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Open to the world ✅
  }

  ingress {
    description = "HTTPS traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Backend API (Express + Socket.IO)"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Jenkins Web UI"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1" # "-1" means ALL protocols
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg"
  }
}

resource "aws_instance" "brainbrush_server" {
  ami = var.ami_id != "" ? var.ami_id : data.aws_ami.ubuntu.id

  instance_type = var.instance_type           # t2.medium
  subnet_id     = aws_subnet.public_subnet.id # Put it in our public subnet

  vpc_security_group_ids = [aws_security_group.brainbrush_sg.id] # Apply our firewall rules

  key_name = var.key_pair_name # SSH key for access

  root_block_device {
    volume_size = 20    # GB
    volume_type = "gp3" # General Purpose SSD (good balance of cost + speed)
  }

  tags = {
    Name        = "${var.project_name}-server"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}
