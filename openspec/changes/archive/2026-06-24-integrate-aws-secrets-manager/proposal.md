## Why

Currently, database credentials and connection properties are passed as plain text or static values through CI/CD environment variables and Ansible configurations onto the EC2 host. To follow security best practices, we need to transition to dynamic credential resolution using AWS Secrets Manager, while ensuring developers can still run local database setups easily without needing cloud credentials.

## What Changes

- Add `spring-cloud-aws-starter-secrets-manager` to the backend dependencies.
- Update `application.yaml` to include an explicit profile-based import toggle (the `aws` profile) for AWS Secrets Manager config import.
- Configure Spring Boot to fall back automatically to standard local properties when the `aws` profile is not active (Scenario A).
- Allow local developers to toggle cloud database connections by enabling `aws` along with their target env profile (Scenario B).
- Adjust Ansible playbooks and IAM roles to fetch credentials dynamically at runtime on the EC2 host, removing plain-text secrets from server variables.
- Manage the AWS Secrets Manager secret and backend IAM permissions (instance profile) directly in Terraform inside the backend module.

## Capabilities

### New Capabilities
- `aws-secrets-manager`: Integrates AWS Secrets Manager into the Spring Boot application configuration and allows dynamic retrieval of sensitive environment values using Spring Cloud AWS.

## Impact

- **Backend**: `pom.xml`, `application.yaml`, and potentially `spring-app.service.j2` Systemd configuration.
- **Infrastructure**: AWS IAM Roles/Instance Profile for EC2, AWS Secrets Manager secrets.
- **Deployment**: Ansible deployment variables and playbooks.
