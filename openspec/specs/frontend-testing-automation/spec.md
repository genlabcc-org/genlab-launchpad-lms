# frontend-testing-automation Specification

## Purpose
TBD - created by archiving change setup-testing-openapi. Update Purpose after archive.
## Requirements
### Requirement: OpenAPI Document Exposure

The Java Spring Boot backend must expose the REST endpoints and DTO schema definition into a local JSON specification endpoint.

#### Scenario: OpenAPI Document Access
- **WHEN** Running the backend server in local dev mode
- **THEN** The endpoint `http://localhost:8080/v3/api-docs` must return the complete OpenAPI 3.x schema definition.

### Requirement: Automated Frontend Type and Mock Syncing

The React frontend build configurations must expose a command-line script that automatically consumes the backend OpenAPI document, building type-safe schemas and mocks without type duplication.

#### Scenario: Running Sync Command
- **WHEN** Running `npm run openapi:sync` in `app/frontend/`
- **THEN** The system must fetch the live backend specification and generate:
  1. TypeScript type declarations inside `src/api/types/openapi.ts`.
  2. MSW request handler stubs inside `src/api/mocks/generatedHandlers.ts`.

#### Scenario: DRY Type Binding Validation
- **WHEN** Backend schema updates and openapi types are synced
- **THEN** The API model types (`src/api/types/*.ts`) must reference the synced OpenAPI schemas directly (e.g. `components['schemas']['StudentDto']`) to fail compilation automatically if there is any contract drift.

### Requirement: Isolation Test Suite Execution

The frontend must run mock-based integration/unit tests using Vitest, with all network requests intercepted by Mock Service Worker (MSW).

#### Scenario: Running Tests
- **WHEN** Running `npm run test` or `npx vitest`
- **THEN** The test runner must intercept all outgoing Axios network traffic, matching them against MSW handlers, and run assertions in isolation without requiring the Spring Boot backend server to be running.

