terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
    resend = {
      source  = "jhoward321/resend"
      version = "~> 0.1"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  cloud {
    organization = "genlabcc"

    workspaces {
      name = "launchpad-lms-prod"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

provider "supabase" {
  access_token = var.supabase_access_token
}

provider "resend" {
  api_key = var.smtp_pass
}


# Read persistent metadata application details from metadata state
data "terraform_remote_state" "metadata" {
  backend = "remote"

  config = {
    organization = "genlabcc"
    workspaces = {
      name = "launchpad-lms-metadata-prod"
    }
  }
}

locals {
  # Construct tag required for myApplication linking
  application_tag = {
    "awsApplication" = data.terraform_remote_state.metadata.outputs.application_arn
  }
}

module "secrets" {
  source                    = "../../modules/secrets"
  environment               = "prod"
  application_tag           = local.application_tag
  db_url                    = replace(module.database.db_url, "postgresql://", "jdbc:postgresql://")
  supabase_url              = module.database.supabase_url
  supabase_anon_key         = module.database.anon_key
  supabase_service_role_key = module.database.service_role_key
}

module "database" {
  source                   = "../../modules/database"
  supabase_organization_id = var.supabase_organization_id
  environment              = "prod"
  region                   = "ap-south-1"
  db_password              = module.secrets.db_password
  use_branching            = var.use_branching
  supabase_project_ref     = var.supabase_project_ref
}

module "smtp" {
  source = "../../modules/smtp"

  project_ref                 = module.database.project_id
  smtp_pass                   = var.smtp_pass
  smtp_admin_email            = "no-reply@${var.root_domain_name}"
  smtp_sender_name            = "GenLab Launchpad"
  domain_name                 = var.root_domain_name
  environment                 = "prod"
  enable_email_otp            = var.enable_email_otp
  enable_mobile_otp           = var.enable_mobile_otp
  magic_link_template_content = file("${path.module}/../../../supabase/templates/magic_link.html")
}


module "backend" {
  source          = "../../modules/backend"
  environment     = "prod"
  secret_arn      = module.secrets.secret_arn
  ami_id          = var.ami_id
  instance_type   = "t4g.small"
  aws_region      = var.aws_region
  domain_name     = var.root_domain_name # Backend resolves to api.genlablaunchpad.cc
  dns_zone_name   = var.dns_zone_name
  application_tag = local.application_tag
}

module "frontend" {
  source                  = "../../modules/frontend"
  domain_name             = "www.${var.root_domain_name}" # Frontend resolves to www.genlablaunchpad.cc
  additional_domain_names = [var.root_domain_name]
  dns_zone_name           = var.dns_zone_name
  application_tag         = local.application_tag
}
