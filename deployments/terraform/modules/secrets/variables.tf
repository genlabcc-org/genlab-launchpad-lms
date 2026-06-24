variable "environment" {
  description = "The target deployment environment name (e.g. dev, staging, prod)"
  type        = string
}

variable "application_tag" {
  description = "Tag for Service Catalog AppRegistry myApplication mapping"
  type        = map(string)
  default     = {}
}

variable "db_url" {
  description = "The database connection URL for the environment"
  type        = string
  sensitive   = true
}

variable "db_username" {
  description = "The master database username"
  type        = string
  default     = "postgres"
}



variable "supabase_url" {
  description = "The API Gateway URL of the Supabase project"
  type        = string
}

variable "supabase_anon_key" {
  description = "The publishable anonymous key for client authentication"
  type        = string
  sensitive   = true
}

variable "supabase_service_role_key" {
  description = "The private service role key"
  type        = string
  sensitive   = true
}

variable "supabase_jwt_secret" {
  description = "The JWT secret for Supabase auth. Default is 'PLACEHOLDER' to be set manually."
  type        = string
  default     = "PLACEHOLDER"
  sensitive   = true
}
