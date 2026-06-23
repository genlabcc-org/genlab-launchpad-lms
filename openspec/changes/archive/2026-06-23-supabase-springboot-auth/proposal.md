## Why

Currently, the GenLab Launchpad LMS API does not have any authentication or authorization mechanism. To secure the LMS platform, we need to integrate Supabase Auth with Role-Based Access Control (RBAC) to distinguish between students (authenticate via Phone OTP/SMS), mentors (authenticate via Email OTP with emails ending in `.genlab@gmail.com`), and admin/HR members (authenticate via Email OTP restricted to the `@genlab.cc` domain).

## What Changes

- **New Database Objects**:
  - `user_role` DB enum (`student`, `mentor`, `admin`).
  - `user_roles` table mapping Supabase `auth.users(id)` to `user_role`.
  - Database function and trigger on `auth.users` to automatically assign roles:
    - `admin` for users signing up with an email ending in `@genlab.cc`.
    - `mentor` for users signing up with an email ending in `.genlab@gmail.com`.
    - `student` for all other signups (e.g. Phone OTP).
- **Authentication & Sign-In Controls**:
  - **Only Admin Creation**: Only admins have the ability to create logins (registers new student/mentor accounts).
  - **Sign-in Only for Students & Mentors**: Students and mentors can only sign-in (OTP sending is disabled for non-existent users by setting `create_user: false`).
  - **Admin Seeding**: The initial admin email list is pre-seeded during deployment (configured via environment variables or seed scripts).
- **Security Middleware & Filters**:
  - Add Spring Security dependency and configuration.
  - Implement a custom `SupabaseJwtFilter` to intercept and validate Supabase JWT tokens, extracting user ID and claims.
- **RBAC & Annotation-based Access Control**:
  - Create a custom `@RequiresRole` annotation.
  - Implement a Spring AOP aspect `RoleCheckAspect` to intercept annotated controllers and enforce permissions.
- **Role Caching**:
  - Integrate Caffeine Cache in Spring Boot to cache user roles retrieved from the database, preventing DB hits on every API request.
- **REST Endpoints**:
  - Public authentication routes under `/auth/**` (e.g., student, mentor, and admin send/verify OTP).
  - Secured student routes under `/api/student/**` (requires `student` role).
  - Secured mentor routes under `/api/mentor/**` (requires `mentor` role).
  - Secured admin routes under `/api/admin/**` (requires `admin` role, including endpoints to create student/mentor logins).

## Capabilities

### New Capabilities
- `supabase-springboot-auth`: Implements authentication and authorization logic using Supabase OTP (Phone/Email) and custom AOP-based RBAC in Spring Boot supporting `student`, `mentor`, and `admin` roles, restricting signup/login creation to admins.

### Modified Capabilities

## Impact

- **Database**: Schema updates (migrations) in Supabase.
- **API**: Addition of authentication endpoints `/auth/**` and secure admin/mentor/student endpoints. Existing `/api/students` and `/api/courses` endpoints will now require Bearer token validation.
- **Dependencies**: Spring Security, JJWT (JWT processing), Caffeine Cache, Spring AOP (AspectJ).
