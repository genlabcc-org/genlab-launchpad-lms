## 1. Backend Layer (Controller/Service/Repository)

- [x] 1.1 Add `springdoc-openapi-starter-webmvc-ui` dependency to `pom.xml`.
- [x] 1.2 Start backend server locally and verify that `http://localhost:8080/v3/api-docs` outputs the OpenAPI schema successfully.

## 2. Frontend Layer (API/Data/View)

- [x] 2.1 Install frontend devDependencies: `vitest`, `msw`, `openapi-typescript`, `msw-auto-mock` (and ensure JSdom or HappyDom is present for DOM tests).
- [x] 2.2 Configure sync and test scripts in `package.json` (such as `openapi:sync` that retrieves `http://localhost:8080/v3/api-docs`).
- [x] 2.3 Create `vitest.config.ts` in the frontend root mapping setup files and JSdom environments.
- [x] 2.4 Create `src/api/setupTests.ts` to initialize and manage the MSW mock server lifecycle.
- [x] 2.5 Run `npm run openapi:sync` to generate the raw OpenAPI type schema `src/api/types/openapi.ts`.
- [x] 2.6 Refactor `src/api/types/models.ts`, `requests.ts`, and `responses.ts` to import and reference types from `openapi.ts` directly, removing manually typed duplicates.
- [x] 2.7 Write an integration validation test `src/api/student.test.ts` to verify that `studentApi.getProfile()` intercepts network traffic via MSW.
- [x] 2.8 Run `npm run test` and `npm run build` to confirm everything compiles and runs successfully.
