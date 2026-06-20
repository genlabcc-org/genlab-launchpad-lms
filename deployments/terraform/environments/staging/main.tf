provider "aws" {
  region = var.aws_region
}

# Create AppRegistry application representing the unified myApplication
resource "aws_servicecatalogappregistry_application" "app" {
  name        = "launchpad-lms-staging"
  description = "Staging environment resources for GenLab Launchpad LMS"
}

resource "aws_servicecatalogappregistry_attribute_group" "metadata" {
  name        = "launchpad-lms-staging-metadata"
  description = "Metadata attribute group for billing and project owners"
  attributes  = jsonencode({
    Environment = "staging"
    Project     = "GenLab Launchpad LMS"
    Owner       = "genlab-admin"
  })
}

resource "aws_servicecatalogappregistry_attribute_group_association" "assoc" {
  application_id      = aws_servicecatalogappregistry_application.app.id
  attribute_group_id = aws_servicecatalogappregistry_attribute_group.metadata.id
}

locals {
  # Construct tag required for myApplication linking
  application_tag = {
    "awsApplication" = aws_servicecatalogappregistry_application.app.arn
  }
  # Dynamic domain setup for staging environment: staging.<prod_url>
  frontend_domain = "staging.${var.root_domain_name}"
}

module "database" {
  source                     = "../../modules/database"
  db_name                    = "launchpad-staging" # Suffix staging
  username                   = var.db_username
  password                   = var.db_password
  subnet_ids                 = var.subnet_ids
  vpc_id                     = var.vpc_id
  allowed_security_group_ids = [module.backend.backend_security_group_id]
  application_tag            = local.application_tag
}

module "backend" {
  source          = "../../modules/backend"
  ami_id          = var.ami_id
  key_name        = var.key_name
  subnet_id       = var.backend_subnet_id
  vpc_id          = var.vpc_id
  domain_name     = local.frontend_domain # Backend resolves to api.staging.genlablaunchpad.cc
  dns_zone_name   = var.dns_zone_name
  application_tag = local.application_tag
}

module "frontend" {
  source              = "../../modules/frontend"
  domain_name         = local.frontend_domain # Frontend resolves to staging.genlablaunchpad.cc
  dns_zone_name       = var.dns_zone_name
  acm_certificate_arn = var.acm_certificate_arn
  application_tag     = local.application_tag
}
