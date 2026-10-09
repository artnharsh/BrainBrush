output "instance_public_ip" {
  description = "The public IP address of the BrainBrush EC2 instance"
  value       = aws_instance.brainbrush_server.public_ip
}

output "instance_id" {
  description = "The EC2 instance ID (useful for AWS CLI commands)"
  value       = aws_instance.brainbrush_server.id
}

output "vpc_id" {
  description = "The VPC ID"
  value       = aws_vpc.brainbrush_vpc.id
}

output "security_group_id" {
  description = "The Security Group ID"
  value       = aws_security_group.brainbrush_sg.id
}

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
