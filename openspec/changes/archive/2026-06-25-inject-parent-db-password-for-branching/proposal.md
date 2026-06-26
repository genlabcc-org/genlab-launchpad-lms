## Why

When Supabase database branching is enabled (`use_branching = true`), non-production environments provision a database branch that automatically inherits the database password of the parent (production) project. Currently, non-production environments generate a random database password and store it in AWS Secrets Manager, leading to an authentication failure because the database branch rejects the generated password.

## What Changes

- Modify the `secrets` module to accept an optional `db_password_override` variable. If provided, the module uses this password instead of generating a new random one.
- Update `dev` and `staging` environments to conditionally fetch the production environment's database password from AWS Secrets Manager if database branching is enabled.
- Pass the retrieved production database password to the `secrets` module as `db_password_override` when `use_branching = true`.
- Keep the lookup conditional based on `use_branching` to avoid needing production AWS Secrets Manager permissions when database branching is disabled.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `supabase-database-provisioning`: Update requirements to specify that non-production database credentials must align with the parent project when branching is enabled.

## Impact

- `deployments/terraform/modules/secrets/variables.tf`: Adds `db_password_override` variable.
- `deployments/terraform/modules/secrets/main.tf`: Uses the override password if provided.
- `deployments/terraform/environments/dev/main.tf`: Conditionally fetches the production secret and passes the password.
- `deployments/terraform/environments/staging/main.tf`: Conditionally fetches the production secret and passes the password.
- `openspec/specs/supabase-database-provisioning/spec.md`: The requirement for toggleable database branching is modified.
