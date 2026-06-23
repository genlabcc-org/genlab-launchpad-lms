## Context

The backend codebase needs a structured approach for writing testing suites. Currently, the test dependencies in `pom.xml` are customized or incomplete (e.g. `spring-boot-starter-webmvc-test` rather than the standard test starter), and annotations like `@MockitoBean` are not consistently documented or enforced.

## Goals / Non-Goals

**Goals:**
- Provide a standardized configuration for Maven test dependencies utilizing modern Spring Boot practices.
- Standardize the annotations and patterns used for testing controller slices, repository slices, service unit tests, and integration tests.
- Set guidelines for mocking dependencies (`@MockitoBean`), injection (`@Autowired` on constructors/fields), naming, and fluent assertions (`assertThat`).

**Non-Goals:**
- Refactoring existing business logic code.
- Converting all existing test classes into integration tests (only demonstrating conventions and patterns).

## Decisions

### 1. Test Client Selection
- **Choice**: Use `MockMvc` for slice tests and standard Spring test client libraries (like `WebTestClient`) for integration tests.
- **Rationale**: `MockMvc` provides lightweight, fast execution for testing controller serialization, validation, and request mappings without running the full Tomcat web container.

### 2. Dependency Declaration
- **Choice**: Restructure `pom.xml` to declare the standard `spring-boot-starter-test` dependency.
- **Rationale**: This starter automatically manages JUnit 5, Mockito, AssertJ, and JSONAssert versions, reducing maintenance overhead and eliminating the need for manual exclusions (since JUnit 4 is excluded by default in modern Spring Boot starters).

### 3. Assertion Engine
- **Choice**: Enforce AssertJ (`assertThat(...)`) instead of JUnit's legacy `assertEquals(...)`.
- **Rationale**: AssertJ provides fluent, readable, and type-safe assertions, making failure reports significantly easier to debug.

### 4. Dependency Mocking
- **Choice**: Enforce `@MockitoBean` for Spring-managed tests (Spring Boot 3.4/4.0+ standard).
- **Rationale**: Spring Boot 3.4 deprecated `@MockBean` and `@SpyBean` in favor of `@MockitoBean` and `@MockitoSpyBean`. Adopting `@MockitoBean` keeps the codebase aligned with current framework releases.

## Risks / Trade-offs

- **Risk**: Constructor injection in tests requires explicit `@Autowired` annotations or global property settings.
  - **Mitigation**: Document that test classes must explicitly use `@Autowired` on constructors or utilize standard field injection to keep test code clean.
