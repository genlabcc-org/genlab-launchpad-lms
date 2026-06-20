## Why

The current repository layout mixes database migrations, infrastructure scripts, and product documentation at the root. Separating these into distinct domains (documentation, deployments, app logic) enables different departments (Product, DevOps, Frontend, Backend) to focus on their codebases, reduces IDE indexing clutter, and allows path-filtered CI/CD builds.

## What Changes

- Relocate database configuration and migrations (`supabase/`) into `deployments/supabase/`.
- Relocate Terraform scripts (`terraform/`) into `deployments/terraform/`.
- Create folders for `deployments/ansible/`, `app/frontend/` (React), and `app/backend/` (Spring Boot).
- Establish root-level `.github/workflows/` directory for orchestration.
- Keep `docs/`, `openspec/`, `.agent/`, and `graphify-out/` at the repository root level.

## Capabilities

### New Capabilities
- `repository-structure`: Define and establish the standardized directory layout for application code, deployments, and documentation.

### Modified Capabilities
<!-- None -->
