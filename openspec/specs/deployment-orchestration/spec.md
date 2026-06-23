# deployment-orchestration Specification

## Purpose
TBD - created by archiving change add-aws-deployment-modules-for-frontend-backend-database. Update Purpose after archive.

## Requirements

### Requirement: Sequenced Orchestration Workflow
The GitHub Actions workflow SHALL sequence the infrastructure changes, compilation, and host configuration tasks in a deterministic order.

#### Scenario: Verify execution sequence
- **WHEN** the deployment workflow is triggered
- **THEN** it MUST first apply Terraform to ensure infrastructure exists, compile the Spring Boot backend artifact, and finally execute Ansible to deploy and configure the application

#### Scenario: Prod deployment trigger constraint
- **WHEN** a pull request is opened targeting the `main` branch
- **THEN** the production deployment workflow MUST NOT trigger, executing only when the pull request is successfully merged (push event on `main`)

### Requirement: Dynamic Host Resolution
The CI/CD workflow SHALL extract Terraform outputs to define the targets for Ansible execution.

#### Scenario: Resolve compute IP address
- **WHEN** Terraform completes successfully
- **THEN** the workflow MUST extract the backend instance IP from the Terraform output and inject it into the Ansible dynamic inventory or host target configuration

### Requirement: Supabase Database Migration Mode
The CI/CD workflow SHALL support toggling Supabase migration targeting between static project-level databases and dynamic branch-level databases.

#### Scenario: Project-level migration deployment
- **WHEN** the migration mode is configured as `project`
- **THEN** migrations MUST be applied directly to the static environment-specific project reference mapped using the environment name suffix (e.g., project-name-dev or project-name-prod)

#### Scenario: Branch-level migration deployment
- **WHEN** the migration mode is configured as `branch`
- **THEN** the CI/CD pipeline MUST use the Supabase CLI to dynamically link migrations to a Git-ref database branch

### Requirement: Non-Production Infrastructure Teardown
The CI/CD system SHALL automatically destroy and tear down transient infrastructure when feature branches or pull requests are closed.

#### Scenario: Pull request closed teardown
- **WHEN** a pull request targeting `dev` is closed
- **THEN** the system MUST run `terraform destroy` in the target environment and execute `supabase db branch delete` to wipe dynamic database sandboxes

#### Scenario: Manual dispatch teardown
- **WHEN** the deployment workflow is triggered manually with action set to `destroy`
- **THEN** the system MUST run `terraform destroy` in the target environment
