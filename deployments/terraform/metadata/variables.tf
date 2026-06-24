variable "aws_region" {
  description = "The AWS region to deploy resources into"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Target environment (dev, staging, prod)"
  type        = string
}

variable "project_name" {
  description = "The project name for billing and tagging"
  type        = string
  default     = "GenLab Launchpad LMS"
}

variable "owner" {
  description = "Owner of the resources"
  type        = string
  default     = "genlab-admin"
}
