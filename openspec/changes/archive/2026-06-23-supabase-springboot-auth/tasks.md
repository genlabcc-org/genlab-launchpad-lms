## 1. Database Schema Setup

- [x] 1.1 Create a new migration file under `deployments/supabase/migrations/` to define the `user_role` enum (`student`, `mentor`, `admin`) and the `user_roles` table.
- [x] 1.2 Write the SQL trigger function `handle_new_user` and trigger `on_auth_user_created` to auto-assign roles based on the email domain (`@genlab.cc` -> `admin`, ends with `.genlab@gmail.com` -> `mentor`, default -> `student`).
- [x] 1.3 Add a database migration/seeding script to pre-seed the admin users' roles using the configured admin list during deployment.
- [x] 1.4 Update `deployments/supabase/seed.sql` to seed mock admin, mentor, and student user accounts in `auth.users` for local development.

## 2. Spring Boot Configuration & Dependencies

- [x] 2.1 Add Maven dependencies for Spring Security, Spring AOP, WebFlux (for WebClient), JJWT (jsonwebtoken), and Caffeine caching to `pom.xml`.
- [x] 2.2 Add configurations for `supabase.url`, `supabase.anon-key`, `supabase.jwt-secret`, and `supabase.service-role-key` in `application.yaml`.
- [x] 2.3 Add property configuration to read seeded admin email lists.
- [x] 2.4 Update backend `.env` file with local Supabase keys (including service role key) for local setup compatibility.

## 3. Security Filter and Role Caching

- [x] 3.1 Implement `SupabaseJwtFilter` extending `OncePerRequestFilter` to validate Bearer JWT tokens and set user credentials/claims in Spring Security Context.
- [x] 3.2 Implement `CacheConfig` to setup a Caffeine CacheManager with the `userRoles` cache (10 mins TTL, size 1000).
- [x] 3.3 Implement `RoleService` to query the `user_roles` table in Supabase (caching results via `@Cacheable`).

## 4. RBAC Annotation & AOP Aspect

- [x] 4.1 Define the custom annotation `@RequiresRole` targeting methods at runtime.
- [x] 4.2 Implement `RoleCheckAspect` using AspectJ to intercept `@RequiresRole` annotations, extract the user ID, check their role via `RoleService`, and throw `ResponseStatusException` (HTTP 403) on mismatch.
- [x] 4.3 Configure `SecurityConfig` to disable CSRF, set session creation policy to STATELESS, register `SupabaseJwtFilter`, permit `/auth/**` paths, and require authentication for any other requests.

## 5. Controllers and Endpoints

- [x] 5.1 Implement `AuthController` with endpoints for student and mentor OTP requests, passing `create_user = false` to allow sign-in only.
- [x] 5.2 Implement `StudentPortalController` mapped to `/api/student` with `/dashboard` and `/profile` endpoints annotated with `@RequiresRole("student")`.
- [x] 5.3 Implement `MentorPortalController` mapped to `/api/mentor` with `/dashboard` and `/profile` endpoints annotated with `@RequiresRole("mentor")`.
- [x] 5.4 Implement `AdminController` mapped to `/api/admin` with `/dashboard`, `/students`, and a user creation endpoint `POST /api/admin/users` (uses the Service Role Key to create logins in Supabase).

## 6. Testing & Verification

- [x] 6.1 Write unit tests for `RoleCheckAspect` to verify role matching for students, mentors, and admins.
- [x] 6.2 Write unit/slice tests for `AuthController` to verify input validation, suffix matching, and sign-in only constraints.
- [x] 6.3 Perform manual verification of the complete Phone/Email OTP authentication and authorization flow for all three roles using the local Supabase container.
