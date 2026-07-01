## Context

We are establishing Vitest and Mock Service Worker (MSW) on the React frontend to build a test suite validating API integration. We want to auto-compile type models and mocks from Spring Boot OpenAPI metadata to ensure zero drift.

## Goals / Non-Goals

**Goals:**
- Add `springdoc-openapi` dependencies to the Spring Boot backend.
- Expose `/v3/api-docs` dynamically when running the Spring Boot backend server.
- Install and configure `vitest` and `msw` on the React app.
- Provide a CLI-driven sync script (`npm run openapi:sync`) that triggers `openapi-typescript` and `msw-auto-mock` to build TS interfaces and mock handlers.
- Refactor the frontend types layer (`src/api/types/models.ts`, `requests.ts`, `responses.ts`) to dynamically reference generated schemas from `src/api/types/openapi.ts` directly, adhering to the DRY principle.
- Configure the Vitest setup file to start the MSW server before test executions.

**Non-Goals:**
- Compiling Spring Boot with heavy plugins that start the entire application context (along with Supabase and AWS connectors) during standard build pipeline compile phases, to avoid compile-time environment-dependent blocker risks.

## Decisions

1. **OpenAPI Output**: The backend exposes `/v3/api-docs` when running in the development profile. The frontend retrieves this spec using a fetch helper script (`curl http://localhost:8080/v3/api-docs > target/openapi.json` or directly calling the URL during type generation).
2. **Types Generation**: The generated TypeScript types will be outputted to `src/api/types/openapi.ts`.
3. **DRY Types**: All base, request, and response model types in the API layer will import and map from `components['schemas']` exported in `openapi.ts`. This makes the type definitions automatically updated without duplication.
4. **Mocks Generation**: The MSW generated mock handlers will be stored in `src/api/mocks/generatedHandlers.ts` with prefix option `/api`.
5. **Test Environment**: Vitest will be configured to use `jsdom` or `happy-dom` to support localStorage and DOM APIs, with `setupFiles: ['./src/api/setupTests.ts']`.

## Risks / Trade-offs

- **Risk**: Auto-generated handlers might return generic stub data (e.g. empty strings/arrays) that doesn't fit specific positive scenarios in tests.
- **Mitigation**: Developers can override handlers in individual test files using `server.use(...)` to supply custom responses.
