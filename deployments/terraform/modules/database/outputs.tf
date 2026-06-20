output "db_endpoint" {
  description = "The connection endpoint for the database"
  value       = aws_db_instance.db.endpoint
}

output "db_host" {
  description = "The address of the RDS instance"
  value       = aws_db_instance.db.address
}

output "db_port" {
  description = "The database port"
  value       = aws_db_instance.db.port
}

output "db_security_group_id" {
  description = "The ID of the DB security group"
  value       = aws_security_group.db_sg.id
}
