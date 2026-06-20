resource "aws_db_subnet_group" "db_subnets" {
  name       = "${var.db_name}-subnet-group"
  subnet_ids = var.subnet_ids

  tags = merge(
    {
      Name = "${var.db_name}-subnet-group"
    },
    var.application_tag
  )
}

resource "aws_security_group" "db_sg" {
  name        = "${var.db_name}-db-sg"
  description = "Database Security Group"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = var.allowed_security_group_ids
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = merge(
    {
      Name = "${var.db_name}-db-sg"
    },
    var.application_tag
  )
}

resource "aws_db_instance" "db" {
  allocated_storage      = var.allocated_storage
  engine                 = "postgres"
  engine_version         = "15"
  instance_class         = var.instance_class
  db_name                = var.db_name
  username               = var.username
  password               = var.password
  db_subnet_group_name   = aws_db_subnet_group.db_subnets.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  skip_final_snapshot    = true

  tags = merge(
    {
      Name = var.db_name
    },
    var.application_tag
  )
}
