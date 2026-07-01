## Why

The current React frontend application lacks a dedicated, unified API layer to communicate with the Spring Boot backend. There is no type-safe wrapper for the request and response shapes, leading to developer friction, lack of autocomplete, potential type mismatches, and direct Supabase access bypass. 

Implementing a robust, fully-typed API layer using Axios ensures strict type checking, consistent error handling, automatic JWT injection, and maintains a clean 3-layer architecture (API Layer -> Data/Store Layer -> View Layer) that decouples view components from raw network details.

## What Changes

We will introduce a complete API layer under the frontend's `src/api` directory. This includes:
1. An Axios client instance with request interceptors to parse and attach Supabase-issued authorization JWT tokens.
2. Distinct endpoint service files grouped by functional domains: `auth.ts`, `admin.ts`, `student.ts`, `mentor.ts`, and `shared.ts`.
3. Fully typed interfaces matching every backend Java DTO record for all API request bodies and response payloads.
4. Strict enforcement of SOLID (high priority), KISS, and DRY principles, ensuring backend-frontend type safety.

## Capabilities

### New Capabilities
- `frontend-api-layer`: Unified type-safe Axios HTTP client and domain-specific endpoints communicating exclusively with backend API proxy endpoints.

### Modified Capabilities
<!-- None -->

## Impact

- **Frontend**: Adds `src/api/` folder and dependencies on Axios. All network communication will use these services. No direct database or Supabase queries from the view layer.
- **Styling**: Component styling uses Hero UI customized for light and dark themes, though custom theme changes remain parameterized and disabled until explicit approval.
- **Authentication**: Extracted and verified from locally stored JWT tokens and sent via authorization headers.
