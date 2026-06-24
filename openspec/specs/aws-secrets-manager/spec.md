# aws-secrets-manager Specification

## Purpose
TBD - created by archiving change integrate-aws-secrets-manager. Update Purpose after archive.
## Requirements
### Requirement: Toggleable AWS Secrets Manager Integration
The system MUST support an explicit Spring profile configuration to toggle the integration of AWS Secrets Manager.

#### Scenario: Running with local configuration (default)
- **WHEN** the Spring Boot application starts without the `aws` profile enabled
- **THEN** the system SHALL ignore AWS Secrets Manager configuration imports and connect to the database using default local credentials from application.yaml

#### Scenario: Running with AWS integration enabled
- **WHEN** the Spring Boot application starts with both `aws` and an environment profile (e.g. `staging`) enabled
- **THEN** the system SHALL dynamically fetch configuration properties from the AWS Secrets Manager secret named `/config/genlab-launchpad-lms-api_staging` and override the local database connection details

### Requirement: Infrastructure-managed Secret and IAM Permissions
The infrastructure MUST provision a secure AWS Secrets Manager secret and assign read-only access permissions to the EC2 backend host.

#### Scenario: Successful secrets and IAM provisioning
- **WHEN** Terraform is applied for an environment
- **THEN** an AWS Secrets Manager secret named `/config/genlab-launchpad-lms-api_<environment>` SHALL be created and a dedicated IAM Instance Profile with read-only access to that secret SHALL be attached to the EC2 instance

