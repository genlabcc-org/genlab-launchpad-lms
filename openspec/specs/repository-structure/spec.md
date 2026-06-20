# repository-structure Specification

## Purpose
TBD - created by archiving change restructure-repository-layout. Update Purpose after archive.
## Requirements
### Requirement: Structured Workspace Layout
The repository SHALL organize its contents into distinct root-level directories corresponding to documentation, deployments, and core application code.

#### Scenario: Documentation and specifications placement
- **WHEN** the repository layout is accessed
- **THEN** `docs/`, `openspec/`, and `.agent/` directories MUST remain at the repository root level

#### Scenario: Deployment resources placement
- **WHEN** DevOps or database configuration resources are created or modified
- **THEN** they MUST be located under the `deployments/` root directory (specifically `deployments/supabase/`, `deployments/terraform/`, and `deployments/ansible/`)

#### Scenario: Core application logic placement
- **WHEN** frontend or backend codebases are created or modified
- **THEN** they MUST be located under the `app/` root directory (specifically `app/frontend/` for React and `app/backend/` for Spring Boot)

### Requirement: CI/CD Orchestration and Path Filtering
The system SHALL run automated workflow runs in response to push/PR events only when changes are made inside the specific folder belonging to the affected team.

#### Scenario: Frontend only changes
- **WHEN** a push occurs containing changes solely within the `app/frontend/` directory
- **THEN** the repository's frontend GitHub Action workflow SHALL run, while the backend and infrastructure workflows SHALL NOT run

#### Scenario: Backend only changes
- **WHEN** a push occurs containing changes solely within the `app/backend/` directory
- **THEN** the repository's backend GitHub Action workflow SHALL run, while the frontend and infrastructure workflows SHALL NOT run

