# ===========================================================================
# TERRAFORM OUTPUTS — Values extracted AFTER resources are created
# ===========================================================================
#
# 🎓 WHAT ARE OUTPUTS?
# After `terraform apply` creates your infrastructure, you often need to know
# certain values — like the IP address of your new server.
# Outputs display these values in the terminal and make them available to
# other tools (like Ansible, which needs the IP to SSH in).
#
# 🎓 HOW TO USE OUTPUTS:
#   terraform output                    # Show all outputs
#   terraform output instance_public_ip # Show just the IP
#   terraform output -raw instance_public_ip  # Show without quotes (useful in scripts)
# ===========================================================================


output "instance_public_ip" {
  description = "The public IP address of the BrainBrush EC2 instance"
  value       = aws_instance.brainbrush_server.public_ip
  # 💡 You'll use this IP to:
  #   1. SSH into the server: ssh -i key.pem ubuntu@<this_ip>
  #   2. Configure Ansible inventory
  #   3. Access the app: http://<this_ip>
}

output "instance_id" {
  description = "The EC2 instance ID (useful for AWS CLI commands)"
  value       = aws_instance.brainbrush_server.id
  # Example ID: i-0abcdef1234567890
  # Useful for: aws ec2 describe-instances --instance-ids <id>
}

output "vpc_id" {
  description = "The VPC ID"
  value       = aws_vpc.brainbrush_vpc.id
}

output "security_group_id" {
  description = "The Security Group ID"
  value       = aws_security_group.brainbrush_sg.id
}

# ---------------------------------------------------------------------------
# Helpful connection info (printed after terraform apply)
# ---------------------------------------------------------------------------
output "ssh_command" {
  description = "Ready-to-use SSH command to connect to the server"
  value       = "ssh -i ${var.private_key_path} ubuntu@${aws_instance.brainbrush_server.public_ip}"
}

output "app_url" {
  description = "URL to access the BrainBrush frontend"
  value       = "http://${aws_instance.brainbrush_server.public_ip}"
}

output "backend_url" {
  description = "URL to access the BrainBrush backend API"
  value       = "http://${aws_instance.brainbrush_server.public_ip}:5000"
}
