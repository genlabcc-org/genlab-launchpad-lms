## Context

When using Supabase database branching (`use_branching = true`), non-production environments (like `dev` and `staging`) provision a `supabase_branch` rather than a standalone project. Since Supabase database branches clone the parent project, they inherit the parent project's database password. 

Currently, the `secrets` module always generates a new random password and stores it in AWS Secrets Manager, resulting in a connection failure for the backend application because the database branch refuses authentication using this newly generated password.

This design document outlines how to retrieve the parent project's database password from AWS Secrets Manager dynamically and pass it as an override to the non-production environments.

## Goals / Non-Goals

**Goals:**
- Dynamically fetch the production database password from AWS Secrets Manager inside non-production environments when database branching is active.
- Allow the `secrets` module to accept a database password override instead of generating a new random password.
- Maintain environment isolation and least privilege by making production secret lookups conditional.

**Non-Goals:**
- Modifying how production database passwords are generated or rotated.
- Executing manual SQL commands on the branch database to force-change its password.

## Decisions

### Decision 1: Accept an optional `db_password_override` variable in the secrets module
- **Rationale**: Introducing `db_password_override` to the `secrets` module makes it highly flexible. If provided, the module uses it; if null or empty, it generates a random password. This ensures compatibility with both standalone and branching configurations.
- **Alternatives**: 
  - *Pass password into the database module and have it output it*: Rejected because the `secrets` module is the single source of truth for generating and storing config values. Changing the flow would create circular dependencies.

### Decision 2: Fetch the parent password via AWS Secrets Manager data source in dev/staging environments
- **Rationale**: Fetching the password directly from AWS Secrets Manager using a `data` block is cleaner than retrieving it from a remote state. We can restrict IAM policies specifically to that single path (`/config/genlab-launchpad-lms-api_prod`).
- **Alternatives**:
  - *Terraform Remote State*: Reading from the production workspace state (`launchpad-lms-prod`). Rejected because this requires broad read permissions to the entire production state, which exposes other infrastructure details.
  - *Hardcoded input variables*: Rejected because it violates production security best practices.

### Decision 3: Use conditional data sources (`count = var.use_branching ? 1 : 0`)
- **Rationale**: Non-production environments only fetch the production secret if branching is explicitly enabled. This ensures that in the default setup, no production-level IAM permissions are required for the non-production deployment pipelines.

## Risks / Trade-offs

- **[Risk]** The IAM role/credentials running the `dev` or `staging` Terraform pipeline must have `secretsmanager:GetSecretValue` permission for the production secret `/config/genlab-launchpad-lms-api_prod`.
  - *Mitigation*: Limit the IAM policy to this specific resource ARN and only grant read-only permissions.
- **[Risk]** If the production database password is changed, the dev branch database password will also mismatch until the dev Terraform workspace is re-applied.
  - *Mitigation*: Since dev databases are ephemeral branches, re-running the Terraform apply will fetch the updated production password, sync AWS Secrets Manager, and restore connectivity.
