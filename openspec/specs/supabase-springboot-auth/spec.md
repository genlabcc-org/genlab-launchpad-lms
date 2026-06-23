# Supabase Auth & Spring Boot Integration Specification

## Purpose
This specification defines the requirements for integrating Supabase Authentication with Role-Based Access Control (RBAC) in the Spring Boot backend application, including custom database triggers, token security filters, caching user roles, and restricting admin signups.

## Requirements

### Requirement: Database Role Mapping and Auto-Assignment Trigger
The database SHALL support three distinct user roles: `student`, `mentor`, and `admin`. Upon user creation in Supabase auth, a database trigger MUST automatically assign:
- `admin` if the user's email ends with `@genlab.cc`.
- `mentor` if the user's email ends with `.genlab@gmail.com` (e.g. `john.genlab@gmail.com`).
- `student` for all other users (e.g. phone signups).

#### Scenario: Admin auto-assignment by email domain
- **WHEN** a new user is created in `auth.users` with email `john.doe@genlab.cc`
- **THEN** a row is inserted in `public.user_roles` with role `admin` for that user.

#### Scenario: Mentor auto-assignment by email suffix
- **WHEN** a new user is created in `auth.users` with email `alice.genlab@gmail.com`
- **THEN** a row is inserted in `public.user_roles` with role `mentor` for that user.

#### Scenario: Student auto-assignment by default
- **WHEN** a new user is created in `auth.users` with a phone number or a non-matching email address
- **THEN** a row is inserted in `public.user_roles` with role `student` for that user.

---

### Requirement: Token Validation and Security Filter
The Spring Boot application MUST intercept incoming HTTP requests with an Authorization header, parse and validate the Bearer JWT token using the Supabase JWT secret, and configure the Spring SecurityContext with the authenticated user ID and claims.

#### Scenario: Valid JWT authentication
- **WHEN** a request has a valid Bearer token signed with the configured Supabase JWT secret
- **THEN** the request attributes `userId`, `email`, and `phone` are populated from claims and the request proceeds.

#### Scenario: Invalid or expired JWT authentication
- **WHEN** a request has an invalid, expired, or malformed Bearer token
- **THEN** the request is rejected immediately with an HTTP 401 Unauthorized response.

---

### Requirement: Role-Based Access Control and AOP Security Enforcer
The system MUST check and enforce role permissions on controller methods annotated with `@RequiresRole` using a Spring AOP aspect.

#### Scenario: Access allowed when user has the required role
- **WHEN** a user with role `student` calls a controller method annotated with `@RequiresRole("student")`
- **THEN** the execution proceeds successfully.

#### Scenario: Access denied when user does not have the required role
- **WHEN** a user with role `mentor` calls a controller method annotated with `@RequiresRole("admin")`
- **THEN** the execution is blocked and an HTTP 403 Forbidden response is returned.

---

### Requirement: Caffeine Caching for User Roles
The system MUST use Caffeine to cache user roles retrieved from the database/REST API to prevent redundant queries.

#### Scenario: Role retrieval cached on first request
- **WHEN** a role check is triggered for a user ID not present in the cache
- **THEN** the system fetches the role from the database, caches it, and returns the role.

#### Scenario: Cached role returned on subsequent requests
- **WHEN** a role check is triggered for a user ID whose role is already in the cache
- **THEN** the system returns the cached role value directly without querying the database.

---

### Requirement: Login Creation Restricted to Admins
The system MUST restrict user registration and login creation to admins. Students and mentors can only sign in to pre-registered accounts. The initial admin email list MUST be pre-seeded during deployment.

#### Scenario: Admin creates a student or mentor login
- **WHEN** an authenticated user with `admin` role calls `POST /api/admin/users` to register a student or mentor
- **THEN** the system creates the user in Supabase auth and saves their record in the database.

#### Scenario: Non-admin attempts to create a login
- **WHEN** a non-admin or unauthenticated user requests `POST /api/admin/users`
- **THEN** the request is rejected with HTTP 403 Forbidden.

---

### Requirement: Student, Mentor, and Admin Authentication Endpoints
The system MUST expose public authentication endpoints:
- `/auth/student/send-otp` & `/auth/student/verify-otp`
- `/auth/mentor/send-otp` & `/auth/mentor/verify-otp`
- `/auth/admin/send-otp` & `/auth/admin/verify-otp`

Mentor endpoints MUST reject any request for email addresses not ending in `.genlab@gmail.com`. Admin endpoints MUST reject any request for email addresses outside the `@genlab.cc` domain. Non-admin OTP endpoints MUST reject request if the user is not pre-registered.

#### Scenario: Admin OTP request for valid email domain
- **WHEN** a POST request is made to `/auth/admin/send-otp` with a `@genlab.cc` email
- **THEN** the system requests Supabase to send an email OTP and returns success.

#### Scenario: Mentor OTP request for valid email suffix
- **WHEN** a POST request is made to `/auth/mentor/send-otp` with a `.genlab@gmail.com` email (e.g. `john.genlab@gmail.com`)
- **THEN** the system requests Supabase to send an email OTP and returns success.

#### Scenario: Mentor OTP request for invalid email suffix
- **WHEN** a POST request is made to `/auth/mentor/send-otp` with an email not ending in `.genlab@gmail.com`
- **THEN** the request is rejected with HTTP 403 Forbidden.

#### Scenario: Student OTP request with valid phone format
- **WHEN** a POST request is made to `/auth/student/send-otp` with a phone number in E.164 format (e.g. starting with `+`)
- **THEN** the system requests Supabase to send an SMS OTP and returns success.

#### Scenario: Sign-in only for unregistered student
- **WHEN** a student requests to send OTP for an unregistered phone number
- **THEN** the request is rejected with HTTP 400 Bad Request.
