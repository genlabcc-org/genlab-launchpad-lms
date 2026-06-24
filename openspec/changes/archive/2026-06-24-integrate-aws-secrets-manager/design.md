## Context

The Java Spring Boot backend needs database connection details. In local development, it defaults to a local PostgreSQL instance. In cloud environments (dev, staging, prod), we want to fetch these credentials securely from AWS Secrets Manager using Spring Cloud AWS.

We need an explicit profile toggle to ensure developers can run local development without needing AWS CLI credentials or trying to connect to AWS.

## Goals / Non-Goals

**Goals:**
- Add Spring Cloud AWS Secrets Manager dependencies to the backend project.
- Modify `application.yaml` to dynamically fetch secrets from AWS Secrets Manager when the `aws` profile is active.
- Ensure that the configuration defaults back to local database credentials if the `aws` profile is not active.
- Manage the AWS Secrets Manager secret and associated IAM roles/policies/instance profile via Terraform in the backend module.

**Non-Goals:**
- Manual creation of secrets or roles in the AWS console.

## Decisions

### 1. Spring Cloud AWS Starter
We will use the official `io.awspring.cloud:spring-cloud-aws-starter-secrets-manager` dependency to handle Secrets Manager integration.

### 2. Multi-Document YAML Configuration
We will split `application.yaml` using `---` to isolate the AWS import configuration block. This block will activate only when the `aws` profile is enabled.

```yaml
---
spring:
  config:
    activate:
      on-profile: aws
    import: "aws-secretsmanager:/config/genlab-launchpad-lms-api_${spring.profiles.active:dev}"
```

This guarantees:
- Normal local runs (default profile) will not attempt to contact AWS and will use default local properties.
- Running with profiles `aws,staging` will load staging secrets from AWS Secrets Manager.

### 3. Terraform Managed Secrets & IAM Profile
The AWS Secrets Manager secret (`/config/genlab-launchpad-lms-api_<environment>`) will be managed via the `backend` Terraform module. The backend EC2 host will be assigned an IAM instance profile containing a read-only policy for that secret. The secret's lifecycle will ignore changes to `secret_string` to allow external modification of other configurations like Supabase JWT or anon keys.

## Risks / Trade-offs

- **[Risk]** Local developer mistakenly runs with `aws` profile active but has no AWS credentials configured.
  - **[Mitigation]** The application will fail to start and log a clear authentication exception, alerting the developer to configure their AWS CLI credentials.
