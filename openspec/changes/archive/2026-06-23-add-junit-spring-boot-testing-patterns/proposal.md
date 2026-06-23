## Why

The backend codebase currently lacks defined conventions and standardized patterns for unit, controller, and integration testing with JUnit. Establishing these patterns will ensure consistent, robust, and maintainable tests across all layers (web, service, and repository) and prevent classpath conflicts or configuration drift as the codebase expands.

## What Changes

- Standardize Spring Boot testing annotations for different layers (`@WebMvcTest`, `@SpringBootTest`, `@DataJpaTest`, `@MockitoBean`).
- Establish standard testing structure patterns (Controller tests with `MockMvc` or `WebTestClient`/`RestTestClient`, service layer unit tests, and full integration tests using `@SpringBootTest` with random port).
- Standardize dependencies in `pom.xml` to use the standard `spring-boot-starter-test` (excluding JUnit 4) and configuring JUnit 5 (`junit-jupiter-engine`).
- Set naming conventions (unit tests end with `Test`, integration tests end with `IT`), injection patterns (constructor injection in tests, no `@Autowired` on constructors), and assertion best practices (AssertJ `assertThat()`).

## Capabilities

### New Capabilities
- `testing/junit-spring-boot`: Standardized testing patterns, annotations, structures, and dependencies for Spring Boot backend testing using JUnit 5.

### Modified Capabilities
<!-- None -->

## Impact

- Modifies [pom.xml](file:///c:/Users/grand/codespace/genlab-launchpad-lms/app/backend/pom.xml) to standardize test dependencies.
- Sets conventions that all existing and future backend test files must conform to.
- Relies on standard Java/Maven build tools and JUnit 5 ecosystem.
