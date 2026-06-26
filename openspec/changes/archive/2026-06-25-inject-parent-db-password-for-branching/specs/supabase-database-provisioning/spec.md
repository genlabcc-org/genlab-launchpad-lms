## MODIFIED Requirements

### Requirement: Toggleable Database Branching
The database module MUST support toggling between database branch-based environment separation and separate standalone project separation via a `use_branching` boolean variable. When database branching is used, the configuration MUST resolve credentials using the parent project's database password to align with the branch database's inherited password.

#### Scenario: Branch-based separation in non-prod
- **WHEN** `use_branching = true`, `environment != "prod"`, and a parent project reference is provided
- **THEN** the module provisions a database branch (`supabase_branch`) under the parent project instead of creating a new standalone project, and uses the parent project's database credentials for connectivity and secret storage.

#### Scenario: Standalone project separation
- **WHEN** `use_branching = false` (or `environment == "prod"`)
- **THEN** the module provisions a new standalone `supabase_project` named using the environment suffix.
