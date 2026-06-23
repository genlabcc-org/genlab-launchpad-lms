## ADDED Requirements

### Requirement: Modular Terraform Structure
The infrastructure provisioning codebase SHALL utilize reusable modules separated by domain responsibilities under `deployments/terraform/modules/`.

#### Scenario: Verify modules folder exists
- **WHEN** directory path `deployments/terraform/modules` is evaluated
- **THEN** it MUST contain subdirectories for `backend/`, `database/`, and `frontend/`

### Requirement: Environment Isolation and Extensibility
The infrastructure configuration SHALL maintain separate state files and parameters for the environments, allowing additional environments (such as staging) to be added with minimal configuration changes.

#### Scenario: Dev environment configuration
- **WHEN** dev environment configurations are read
- **THEN** they MUST target isolated S3 buckets, EC2 nodes, and database configurations designated for dev use only

#### Scenario: Prod environment configuration
- **WHEN** prod environment configurations are read
- **THEN** they MUST target isolated S3 buckets, EC2 nodes, and database configurations designated for prod use only

#### Scenario: Extensibility for staging environment
- **WHEN** a new staging environment configuration is created
- **THEN** it MUST be able to call the same database, backend, and frontend modules with zero modifications to the module code itself, requiring only new environment parameters

### Requirement: Backend Compute Provisioning
The backend module SHALL provision compute, network configuration, and outputs suitable for deployment.

#### Scenario: Backend module components
- **WHEN** the backend module is applied
- **THEN** it MUST provision an EC2 instance, security groups with ingress port 80/443 (HTTP/HTTPS) and port 22 (SSH), and output the public IP of the compute instance

### Requirement: Database Provisioning
The database module SHALL provision secure database infrastructure and database connection details.

#### Scenario: Database cluster details
- **WHEN** the database module is applied
- **THEN** it MUST provision an RDS instance or DB cluster and output the host connection string and security details, without exposing actual root credentials in git

### Requirement: Static Frontend Hosting
The frontend module SHALL provision resources suitable for serving a static React web application.

#### Scenario: Static frontend hosting setup
- **WHEN** the frontend module is applied
- **THEN** it MUST provision an S3 bucket configured for static web hosting and integrate with a CloudFront CDN distribution for SSL/TLS caching

### Requirement: Dynamic Domain Configuration
The infrastructure provisioning process SHALL parameterize DNS records, ACM certificates, and aliases to support frictionless domain migrations.

#### Scenario: Dynamic hosted zone lookup
- **WHEN** the domain configuration is applied
- **THEN** it MUST dynamically query Route 53 hosted zones using data resources rather than static string hosted zone IDs

#### Scenario: Parameterized DNS records
- **WHEN** Route 53 records and ACM certificates are provisioned
- **THEN** they MUST dynamically read their name strings from root parameters representing the target environment configurations

#### Scenario: Dev environment URL mapping
- **WHEN** dev environment domain configurations are applied
- **THEN** the frontend URL MUST resolve to `dev.${root_domain_name}` and the backend URL MUST resolve to `api.dev.${root_domain_name}`

#### Scenario: Backend subdomain mapping
- **WHEN** DNS records for the backend application are provisioned
- **THEN** Route 53 MUST create an `A` record mapping `api.${domain_name}` (or `api.dev.${domain_name}` for dev) to the backend host

### Requirement: AWS myApplication Metadata Integration
The infrastructure provisioning process SHALL define a Service Catalog AppRegistry Application and enforce resource tagging to bind all sub-module resources together under a single AWS myApplication dashboard.

#### Scenario: Verify application registry setup
- **WHEN** the root module is applied
- **THEN** it MUST create an `aws_servicecatalogappregistry_application` resource representing the unified application

#### Scenario: Tag propagation across sub-modules
- **WHEN** backend, frontend, or database resources are created
- **THEN** they MUST be configured with the specific `awsApplication` tag corresponding to the AppRegistry application ARN to allow monitoring and billing grouping
