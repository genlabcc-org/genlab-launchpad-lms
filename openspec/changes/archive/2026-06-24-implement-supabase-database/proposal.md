## Why

We need to align the system database infrastructure with our core stack, which uses Supabase for database, authentication, and backend services. The current `deployments/terraform/modules/database` module provisions AWS RDS PostgreSQL, which is inconsistent with our architecture. Replacing it with a managed Supabase database module and referencing a separate common SMTP/Resend configuration module from the `organizational-infrastructure` repository ensures a modular, secure, and production-ready environment with toggleable authentication methods.

## What Changes

- Replaced AWS RDS Postgres resources in `deployments/terraform/modules/database` with Supabase project resources (`supabase_project`, `supabase_branch`).
- Added boolean input toggles to enable/disable Email OTP and Mobile (SMS) OTP authentication methods dynamically.
- Integrated the common SMTP/Resend module sourced externally from the `organizational-infrastructure` repository into dev, staging, and prod environments.
- Wired the external `smtp` module to the local `database` module by passing the database module's `project_id` output.

## Capabilities

### New Capabilities
- `supabase-database-provisioning`: Manage Supabase database infrastructure project and branching.
- `supabase-smtp-configuration`: Configure SMTP settings with Resend, OTP toggles, and authentication rates limits for a Supabase project via an externally managed module.

### Modified Capabilities
<!-- None -->

## Impact

- **Terraform Modules:** Refactored `deployments/terraform/modules/database` (variables, main, and outputs) and removed local SMTP configurations in favor of the external `smtp` module.
- **Environment Configurations:** Environments using these modules (e.g. `dev`, `prod`, `staging`) will need to supply Supabase-specific variables (organization ID, database password, region, and OTP/SMTP variables) and wire the external `smtp` module with the local `database` module.
- **CI/CD pipeline & Secrets:** Will need to expose Supabase access tokens, organization IDs, and SMTP details as environment secrets.


