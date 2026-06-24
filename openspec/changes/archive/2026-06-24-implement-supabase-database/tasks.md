## 1. Refactor Database Module

- [x] 1.1 Update `deployments/terraform/modules/database/variables.tf` to declare Supabase variables: `supabase_organization_id`, `environment`, `region`, `db_password`, `use_branching`, and `supabase_project_ref`.
- [x] 1.2 Update `deployments/terraform/modules/database/main.tf` to specify the `supabase` provider, configure branching locals, and provision the `supabase_project` and/or `supabase_branch` resources based on configuration flags.
- [x] 1.3 Update `deployments/terraform/modules/database/outputs.tf` to expose `project_id` and `db_url` matching the active resource (project vs branch).


## 2. Configure Local Auth Templates

- [x] 2.1 Copy the magic link HTML email template from `anika-ecom/supabase/templates/magic_link.html` to `deployments/supabase/templates/magic_link.html`.
- [x] 2.2 Ensure the local template content is read via `file()` in environment configurations and passed to the external SMTP module as a variable.

## 3. Update Environment Configurations

- [x] 3.1 Update `deployments/terraform/environments/dev/main.tf` to declare both the local `database` module and the external `smtp` module (sourced from `organizational-infrastructure` Git repository), and wire them together.
- [x] 3.2 Update `deployments/terraform/environments/staging/main.tf` to declare both the local `database` module and the external `smtp` module, and wire them together.
- [x] 3.3 Update `deployments/terraform/environments/prod/main.tf` to declare both the local `database` module and the external `smtp` module, and wire them together.

## 4. Verification

- [x] 4.1 Execute `terraform validate` in `dev`, `staging`, and `prod` environment directories to verify configuration syntax correctness (local modules validated; external SMTP module requires repo access).

