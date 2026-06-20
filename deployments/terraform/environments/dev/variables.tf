variable "aws_region" {
  description = "The AWS region to deploy resources into"
  type        = string
  default     = "us-west-2"
}

variable "root_domain_name" {
  description = "The root domain name (e.g., genlablaunchpad.cc)"
  type        = string
  default     = "genlablaunchpad.cc"
}

variable "dns_zone_name" {
  description = "The hosted zone name in Route 53"
  type        = string
  default     = "genlablaunchpad.cc"
}

variable "ami_id" {
  description = "The AMI ID for the backend EC2 host (Ubuntu)"
  type        = string
  default     = "ami-03f12c7a6f88d058a" # Example Ubuntu AMI
}

variable "key_name" {
  description = "The SSH key name to configure on the backend compute"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where resources are deployed"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for RDS placement"
  type        = list(string)
}

variable "backend_subnet_id" {
  description = "Subnet ID for the backend compute EC2 instance"
  type        = string
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "dbadmin"
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "acm_certificate_arn" {
  description = "ACM Certificate ARN in us-east-1 (required for CloudFront)"
  type        = string
}
