output "aws_application_arn" {
  description = "The Service Catalog AppRegistry application ARN"
  value       = aws_servicecatalogappregistry_application.app.arn
}

output "database_host" {
  description = "Database connection host"
  value       = module.database.db_host
}

output "database_port" {
  description = "Database connection port"
  value       = module.database.db_port
}

output "backend_public_ip" {
  description = "The public IP of the backend EC2 host"
  value       = module.backend.instance_public_ip
}

output "backend_api_url" {
  description = "The backend API domain"
  value       = module.backend.backend_url
}

output "frontend_url" {
  description = "The static website frontend URL"
  value       = module.frontend.cloudfront_domain_name
}
