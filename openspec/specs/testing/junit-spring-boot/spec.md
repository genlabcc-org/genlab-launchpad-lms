# JUnit 5 & Spring Boot Testing Patterns Specification

## Purpose
This specification defines the testing patterns and conventions for Spring Boot applications in the GenLab Launchpad LMS codebase, utilizing JUnit 5, Spring WebMvcTest, and AssertJ.

## Requirements

### Requirement: Standardized Testing Annotations
The system SHALL use specific Spring Boot test annotations to isolate testing concerns per application layer.

#### Scenario: Controller slice tests
- **WHEN** testing the web controller layer in isolation
- **THEN** the test class MUST be annotated with `@WebMvcTest` and target only the controller under test

#### Scenario: Repository slice tests
- **WHEN** testing data repository classes in isolation
- **THEN** the test class MUST be annotated with `@DataJpaTest` to configure an in-memory database and slice-load data components

#### Scenario: Full integration tests
- **WHEN** executing end-to-end integration tests across all application layers
- **THEN** the test class MUST be annotated with `@SpringBootTest` to bootstrap the full application context

#### Scenario: Dependency mocking in tests
- **WHEN** mocking Spring beans or managed dependencies within slice or integration tests
- **THEN** the mock field MUST be annotated with `@MockitoBean` (replacing the deprecated `@MockBean` annotation)

### Requirement: Test Structure and Instantiation Patterns
The codebase SHALL organize tests into slice, unit, or integration test structures according to the layer being validated.

#### Scenario: Controller layer testing structure
- **WHEN** a controller test class is defined
- **THEN** it MUST use `MockMvc` (for standard mock servlet tests) or `WebTestClient` (for fluent API tests) to perform web requests and assert responses, with all referenced service layers mocked via `@MockitoBean`

#### Scenario: Service layer unit testing structure
- **WHEN** a service layer class is tested
- **THEN** the test class MUST use direct instantiation (calling the constructor with standard Java `new` keyword) and inject mocked dependencies manually in a `@BeforeEach` setup block without loading the Spring container

#### Scenario: Full integration testing structure
- **WHEN** an integration test is defined
- **THEN** the class MUST configure `@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)` to start the application context on a random ephemeral port

### Requirement: Testing Dependencies in Build Configuration
The Maven project build configuration SHALL specify the required testing engines using modern Spring Boot starters.

#### Scenario: Test starter and JUnit 5 configuration
- **WHEN** evaluating test dependencies in `pom.xml`
- **THEN** the build file MUST declare `spring-boot-starter-test` as a test dependency, which automatically configures JUnit 5 (JUnit Jupiter) without requiring manual JUnit 4 exclusions or manual `junit-jupiter-engine` declarations

### Requirement: Testing Best Practices and Conventions
All backend test classes SHALL conform to standardized naming, injection, and assertion conventions.

#### Scenario: Test file naming convention
- **WHEN** naming test classes
- **THEN** unit test classes MUST end with the suffix `Test` (e.g. `HealthControllerTest.java`) and integration test classes MUST end with the suffix `IT` (e.g. `HealthControllerIT.java`)

#### Scenario: Injection in Spring-managed test classes
- **WHEN** injecting fields or dependencies into Spring-bootstrapped test classes (like `@SpringBootTest` or `@WebMvcTest`)
- **THEN** the test class MUST use either field-level injection annotated with `@Autowired` or constructor injection annotated with `@Autowired` (since JUnit 5 requires explicit opt-in for parameter autowiring)

#### Scenario: Assertion libraries usage
- **WHEN** validating values and states in assertions
- **THEN** tests MUST use AssertJ's fluent assertion style (`assertThat()`) and MUST NOT use JUnit's legacy `assertEquals()`

#### Scenario: Mocking external service dependencies
- **WHEN** the test target interacts with external or network-bound dependencies
- **THEN** all such external dependencies MUST be mocked using `@MockitoBean` to ensure tests run in a sandbox
