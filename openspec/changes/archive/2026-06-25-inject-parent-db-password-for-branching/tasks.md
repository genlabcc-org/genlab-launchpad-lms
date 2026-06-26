## 1. Update Secrets Module

- [x] 1.1 Add `db_password_override` input variable to `deployments/terraform/modules/secrets/variables.tf`.
- [x] 1.2 Update `deployments/terraform/modules/secrets/main.tf` local logic to use `var.db_password_override` when provided, instead of generating a new random password.

## 2. Update Dev and Staging Environments

- [x] 2.1 Update `deployments/terraform/environments/dev/main.tf` to conditionally retrieve the production database password from AWS Secrets Manager and pass it to the secrets module.
- [x] 2.2 Update `deployments/terraform/environments/staging/main.tf` to conditionally retrieve the production database password from AWS Secrets Manager and pass it to the secrets module.

## 3. Validation

- [x] 3.1 Run `terraform validate` on `deployments/terraform/environments/dev` to verify configuration syntax.
- [x] 3.2 Run `terraform validate` on `deployments/terraform/environments/staging` to verify configuration syntax.
