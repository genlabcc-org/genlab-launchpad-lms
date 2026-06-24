## 1. Dependencies Setup

- [x] 1.1 Add the Spring Cloud AWS dependency management BOM to pom.xml
- [x] 1.2 Add the spring-cloud-aws-starter-secrets-manager dependency to pom.xml

## 2. Application Configuration

- [x] 2.1 Update application.yaml to isolate the AWS Secrets Manager configuration under the `aws` profile block

## 3. Terraform Infrastructure Configuration

- [x] 3.1 Modify deployments/terraform/modules/backend/variables.tf to add environment, db_url, and db_password
- [x] 3.2 Add aws_secretsmanager_secret and version resources to deployments/terraform/modules/backend/main.tf
- [x] 3.3 Add IAM role, policy, and instance profile resources to deployments/terraform/modules/backend/main.tf
- [x] 3.4 Associate iam_instance_profile with aws_instance.backend in deployments/terraform/modules/backend/main.tf
- [x] 3.5 Update deployments/terraform/environments/dev/main.tf call to backend module
- [x] 3.6 Update deployments/terraform/environments/staging/main.tf call to backend module
- [x] 3.7 Update deployments/terraform/environments/prod/main.tf call to backend module

## 4. Verification

- [x] 4.1 Run maven compilation compile command to verify changes build successfully
- [x] 4.2 Run terraform validate in modules/backend and environments directories
