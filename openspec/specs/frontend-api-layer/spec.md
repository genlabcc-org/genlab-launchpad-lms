# Frontend API Layer Specification

## Purpose
This specification defines the requirements for the frontend API layer of the GenLab Launchpad LMS codebase, utilizing Axios and TypeScript to communicate exclusively with the Spring Boot backend REST endpoints.

## Requirements

### Requirement: Type-Safe API Client
The application must configure and expose a centralized Axios HTTP client that coordinates all outgoing REST requests to the Java backend server.

#### Scenario: Outgoing Request Bearer Injection
- **WHEN** A request is triggered to any authenticated route
- **THEN** The client must read the local JWT token and append it as `Authorization: Bearer <token>` in headers.

#### Scenario: Base API Server Resolution
- **WHEN** Client is initialized
- **THEN** The base URL must resolve dynamically via `import.meta.env.VITE_API_BASE_URL` with a default fallback of `http://localhost:8080`.

### Requirement: Centralized Session Lifespan
The frontend session configuration must define the lifetime of a student, mentor, or admin session.

#### Scenario: CENTRALIZED Session Duration Configuration
- **WHEN** Session checks or validations are performed
- **THEN** The session lifespan must be configured centrally (e.g. `SESSION_DURATION_DAYS = 30`) within a single configurations file.

### Requirement: Strictly Typed Endpoints
All requests and responses interacting with the backend endpoints must use TypeScript definitions derived from Spring Boot controller mappings and DTO schemas.

#### Scenario: API Invocation Validation
- **WHEN** Invoking any endpoint method (such as auth verify or student profile retrieval)
- **THEN** The compilation must strictly require parameters to match the request type schema, and return a Promise resolving to the exact response DTO structure.
