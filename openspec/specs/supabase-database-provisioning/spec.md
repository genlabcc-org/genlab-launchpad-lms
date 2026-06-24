# supabase-database-provisioning Specification

## Purpose
TBD - created by archiving change implement-supabase-database. Update Purpose after archive.
## Requirements
### Requirement: Supabase Database Provisioning
The database module MUST provision a Supabase project using the Supabase provider. It SHALL ignore database password updates after initial creation to prevent service disruption.

#### Scenario: Successful Supabase project creation
- **WHEN** the module is executed with a valid organization ID and master password
- **THEN** a new Supabase project is created with a region matching the inputs, and any database password changes are ignored during subsequent updates.

### Requirement: Toggleable Database Branching
The database module MUST support toggling between database branch-based environment separation and separate standalone project separation via a `use_branching` boolean variable.

#### Scenario: Branch-based separation in non-prod
- **WHEN** `use_branching = true`, `environment != "prod"`, and a parent project reference is provided
- **THEN** the module provisions a database branch (`supabase_branch`) under the parent project instead of creating a new standalone project.

#### Scenario: Standalone project separation
- **WHEN** `use_branching = false` (or `environment == "prod"`)
- **THEN** the module provisions a new standalone `supabase_project` named using the environment suffix.

