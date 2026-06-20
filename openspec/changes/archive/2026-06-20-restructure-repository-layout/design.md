## Context

The project contains several directories mixed at the root (`supabase`, `terraform`, `docs`, `openspec`, `.agent`). As the team grows and introduces React and Spring Boot frameworks, keeping all assets under a flat root structure leads to code pollution, slower IDE operations, and inefficient CI/CD builds since files are not grouped by team responsibility.

## Goals / Non-Goals

**Goals:**
- Separate repository assets by functional groups: documentation, deployments, and app code.
- Restructure existing directories `supabase/` and `terraform/` into `deployments/`.
- Prepare subdirectories for backend (Spring Boot) and frontend (React).
- Set up structure in a clean manner without losing Git history.

**Non-Goals:**
- Initializing or writing actual business logic for React or Spring Boot applications.
- Setting up the fully automated cloud deployment scripts (only standard placeholders and orchestration pathways).

## Decisions

### Move `supabase/` to `deployments/supabase/`
- **Rationale**: Supabase is a database-as-a-service configuration layer. Placing it under `deployments/` ensures DevOps and database administrators own this scope.
- **Alternatives considered**: Leaving it in the root directory (violates separation of concerns).

### Move `terraform/` to `deployments/terraform/`
- **Rationale**: Terraform represents infrastructure-as-code and is owned by DevOps. Placing it under `deployments/` keeps root-level folders uncluttered.

### Establish `app/frontend/` and `app/backend/`
- **Rationale**: React and Spring Boot use completely separate tools, compiler ecosystems, and workflows. Having `app/frontend/` and `app/backend/` provides clean directories for each engineering group.

### Keep `docs/`, `openspec/`, `.agent/` at the root
- **Rationale**: These files/directories relate to the entire project, cross-cutting all teams and systems. They should be universally visible.

## Risks / Trade-offs

- **Supabase CLI paths change**: If developers run local Supabase commands (e.g., `supabase start`), they must run them within `deployments/` or configure the directory parameter.
  - **Mitigation**: Document that Supabase CLI commands should be run using `supabase start --workdir deployments` or `cd deployments && supabase start`.
- **Git History tracking**: Moving directories may make tracking history slightly harder if not using git's rename tracking.
  - **Mitigation**: Use `git mv` (or standard filesystem moves which Git auto-detects as renames on commit).
