## 1. Maven Dependency Configuration

- [x] 1.1 Update `app/backend/pom.xml` to add standard `spring-boot-starter-test` dependency
- [x] 1.2 Remove custom `spring-boot-starter-webmvc-test` and any commented out test dependencies from `pom.xml`

## 2. Implement and Update Testing Patterns

- [x] 2.1 Refactor `HealthControllerTest.java` to use `@WebMvcTest` slice testing with `MockMvc`
- [x] 2.2 Update assertions in `HealthControllerTest.java` to use AssertJ `assertThat` instead of JUnit's legacy `assertEquals`
- [x] 2.3 Verify test conventions for constructors and `@Autowired` in the test classes

## 3. Verification

- [x] 3.1 Run `./mvnw clean test` to ensure all tests build and pass successfully with JUnit 5
