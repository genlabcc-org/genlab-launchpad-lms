variable "ami_id" {
  description = "The AMI ID to use for the instance"
  type        = string
}

variable "instance_type" {
  description = "The instance type to use for the instance"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "The key name to use for the instance"
  type        = string
}

variable "subnet_id" {
  description = "VPC subnet ID to deploy the backend instance into"
  type        = string
}

variable "vpc_id" {
  description = "The VPC ID where security group should reside"
  type        = string
}

variable "domain_name" {
  description = "The domain name for the backend API"
  type        = string
}

variable "dns_zone_name" {
  description = "The hosted zone name in Route 53"
  type        = string
}

variable "application_tag" {
  description = "Tag for Service Catalog AppRegistry myApplication mapping"
  type        = map(string)
  default     = {}
}
