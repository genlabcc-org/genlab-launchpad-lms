## Context

The React frontend requires a clean, type-safe API communication layer with the Spring Boot backend server. Direct calls to database/Supabase from view components are strictly avoided. All network traffic will route through backend REST controllers using Axios.

## Goals / Non-Goals

**Goals:**
- Provide clear TypeScript types/interfaces for all request bodies and response DTO payloads.
- Setup a centralized Axios HTTP client that intercepts outgoing requests to inject JWT auth header (`Authorization: Bearer <token>`) and intercepts incoming requests to manage sessions correctly.
- Provide simple and modular services: `auth.ts`, `admin.ts`, `student.ts`, `mentor.ts`, and `shared.ts`.
- Centralize session configuration to support a configurable duration (30 days).

**Non-Goals:**
- Direct database query implementations.
- UI views rendering or state management store integrations (e.g., Zustand integration). This change is strictly focused on the API layer.

## Decisions

1. **Folder Structure**:
   - Types are located in `src/api/types/` (split into `models.ts`, `requests.ts`, `responses.ts`, `index.ts` for clean separation and import control).
   - Core client is in `src/api/client.ts`.
   - Domain APIs are in `src/api/<domain>.ts`.
2. **Axios Configuration**:
   - The baseURL defaults to `import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'`.
   - Authorization headers are automatically appended if a token exists in `localStorage`.
3. **Session Configuration**:
   - Session duration is set to 30 days. We define a centralized configuration property `SESSION_DURATION_DAYS = 30` in a config object or environment variable.
4. **Decoupling**:
   - The API layer only acts as an HTTP runner, passing types and returning typed promises. State and UI are decoupled.

## Risks / Trade-offs

- **Risk**: Backend updates can drift from typescript types.
- **Mitigation**: Types are directly mirrored from Spring Boot DTO fields. Any future changes in DTOs must propagate to typescript types.
