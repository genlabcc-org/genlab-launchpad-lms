## Context

The current `deployments/terraform/modules/database` module is configured to provision an AWS RDS instance. However, the system's architecture requires a Supabase-managed database, auth, and API platform. We need to refactor the database module to provision Supabase infrastructure and reference a separate external `smtp` module from the `organizational-infrastructure` repository to configure custom SMTP (Resend) and toggleable email/mobile OTP controls.

## Goals / Non-Goals

**Goals:**
- Replace the RDS provisioning in `deployments/terraform/modules/database` with Supabase project provisioning (which manages `supabase_project`).
- Reference the shared, organization-wide SMTP module from the `organizational-infrastructure` repository to manage project configurations via `supabase_settings` (including Custom SMTP with Resend).
- Follow production best practices, including ignoring database password changes and configuring rate limits.
- Add `enable_email_otp` and `enable_mobile_otp` booleans to dynamically enable/disable the respective sign-in/OTP capabilities in the `smtp` module.
- Wire the local database module and external SMTP module together in calling environment configurations.

**Non-Goals:**
- Modifying the Spring Boot Java backend implementation.
- Provisioning actual DNS zones or frontend setups (delegated to their respective modules).
- Creating or editing SMTP module files directly in this workspace (they are managed in the `organizational-infrastructure` repository).

## Decisions

### 1. Supabase Provider Integration
- **Decision:** Use the `supabase/supabase` provider (v1.0.0+).
- **Rationale:** Standardized provider to create, configure, and maintain Supabase projects programmatically.

### 2. Multi-Module Separation of Concerns & Git Module Sourcing
- **Decision:** Separate basic project provisioning from settings configuration and source the settings module externally.
  - The `database` module is local. It provisions either a standalone `supabase_project` or a `supabase_branch` depending on the boolean flag `use_branching` and the target environment (`environment != "prod"`). It outputs the active project/branch `project_id`.
  - The `smtp` module is external. We will source it in our environments using:
    `source = "git::https://github.com/genlabcc/organizational-infrastructure.git//terraform/modules/smtp?ref=main"`
- **Rationale:** Decouples core database provisioning from shared organization-wide resources. Supporting dynamic branching or standalone projects allows local environments to be isolated as needed (either completely distinct projects or lightweight branches off a shared parent).


### 3. OTP Configuration Toggles
- **Decision:** Expose variables `enable_email_otp` and `enable_mobile_otp` as boolean toggles in the `smtp` module call.
- **Rationale:** Allows development environments to selectively toggle sign-in methods matching the requirements of specific client apps or test scenarios.

### 4. Production Hardening
- **Decision:** Implement `lifecycle { ignore_changes = [database_password] }` on the local `supabase_project` resource to prevent accidental resource destruction on database password rotations. Custom SMTP settings (`smtp_host`, `smtp_port`, `smtp_user`, `smtp_pass`, `smtp_sender_name`, `smtp_admin_email`) are configured using Resend parameters.

## Risks / Trade-offs

- **[Risk] Breaking Changes in calling environments:** Switching from RDS to Supabase alters the parameters (removing `subnet_ids`, `vpc_id`, `allowed_security_group_ids` and introducing `supabase_organization_id`, `db_password`, etc.).
- **[Mitigation]** We will update the environment variables and calls in `environments/dev/main.tf`, `environments/staging/main.tf`, and `environments/prod/main.tf` to invoke both the local `database` and the external `smtp` modules and link them correctly.


