variable "domain_name" {
  description = "The domain name for the frontend application (e.g., dev.genlablaunchpad.cc or www.genlablaunchpad.cc)"
  type        = string
}

variable "dns_zone_name" {
  description = "The Route 53 hosted zone name"
  type        = string
}

variable "acm_certificate_arn" {
  description = "The ARN of the ACM certificate to use for CloudFront (must be in us-east-1)"
  type        = string
}

variable "application_tag" {
  description = "Tag for Service Catalog AppRegistry myApplication mapping"
  type        = map(string)
  default     = {}
}
