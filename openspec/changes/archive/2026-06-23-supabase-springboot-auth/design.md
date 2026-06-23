## Context

The GenLab Launchpad LMS platform has no authentication or authorization mechanism currently. To protect student, mentor, and admin data, we must secure the backend APIs using Supabase Auth.
- Students must register and authenticate using **Phone OTP (SMS)**.
- Mentors must authenticate using **Email OTP** with emails ending in `.genlab@gmail.com` (e.g. `xyz.genlab@gmail.com`).
- Admins (HR department) must authenticate using **Email OTP** restricted to the `@genlab.cc` domain.
- The backend must perform Role-Based Access Control (RBAC) to ensure users only access resources corresponding to their roles: `student`, `mentor`, or `admin`.

## Goals / Non-Goals

**Goals:**
- **Secure API endpoints**: Require valid Supabase Bearer JWT tokens for all `/api/**` calls.
- **Implement RBAC**: Assign and verify user roles (`student`, `mentor`, or `admin`) before permitting API access.
- **Auto-assign roles**: Create a database trigger that automatically maps `@genlab.cc` email signups to `admin`, `.genlab@gmail.com` email signups to `mentor`, and all others to `student`.
- **Restricted Login Creation**: Ensure only admin users can create/register new logins (student, mentor, or additional admin accounts).
- **Admin Seeding**: Seed initial admin email addresses during deployment using environment variables / GitHub secrets.
- **Local Setup Compatibility**: Support local seeding of mock admin, mentor, and student users in `auth.users` and `public.user_roles` via `deployments/supabase/seed.sql` to enable full local testing of authentication/OTP without external dependencies.
- **Custom `@RequiresRole` annotation**: Implement an AOP aspect to clean up role-enforcement logic in controllers.
- **Cache roles**: Use Caffeine to cache user roles retrieved from the database to avoid querying Supabase on every request.

**Non-Goals:**
- Supporting username/password login or third-party OAuth (e.g. Google, GitHub).
- Managing SMS provider settings in Spring Boot (Supabase manages the actual SMS gate).
- End-user self-registration screens (disabled for students/mentors).

## Decisions

### 1. Database Role Table and Enum
We will create a `user_roles` table in the database mapping `auth.users` to the roles enum.
- *Alternatives considered*: Storing roles in Spring Boot's database table disconnected from Supabase auth.
- *Rationale*: Storing it in Supabase `public` schema allows us to write database level triggers on user creation, ensuring the role is assigned immediately and atomically.

### 2. Custom AOP Aspect vs Spring Security Expression-Based Access Control (`@PreAuthorize`)
We will enforce role checks using a custom `@RequiresRole` annotation and a Spring AOP aspect `RoleCheckAspect`.
- *Alternatives considered*: Using standard Spring Security `@PreAuthorize("hasRole('admin')")`.
- *Rationale*: A custom AOP aspect is simpler to read, write tests for, and directly maps custom attribute lookup (like looking up user ID from context and retrieving cached role).

### 3. Caffeine Caching
We will configure a Caffeine cache `userRoles` with a maximum size of 1000 and 10 minutes time-to-live (TTL).
- *Alternatives considered*: Querying the Supabase database on every request.
- *Rationale*: Reduces REST or DB query latency to near zero for subsequent requests and prevents rate-limiting / performance issues.

### 4. Admin-Only Sign-up / Sign-in Controls & Local Seeding
We will enforce sign-in only for students and mentors by configuring OTP endpoints to not create new accounts.
- *Implementation*:
  - The student `/auth/student/send-otp` and mentor `/auth/mentor/send-otp` endpoints will send requests to Supabase with `create_user: false`. If a user with the matching phone/email does not exist in Supabase, the request fails.
  - Admins can invite/register new users by calling `POST /api/admin/users`, which uses the Supabase Service Role Key (with administrative rights) to provision the account in Supabase.
  - Initial admins are seeded in the database during deployment using GitHub secrets via application environment variables or seed scripts.
  - **Local Development Seeding**: For local development, mock credentials for admins, mentors, and students will be seeded directly into `auth.users` (and automatically mapped in `public.user_roles` via the trigger) inside `deployments/supabase/seed.sql`. This allows local developers to request OTPs which can be captured by local Supabase inbucket email logs or mock SMS logs.

## Risks / Trade-offs

- **[Risk] Cache Inconsistency**: If an admin changes a user's role in the DB, the user's role in the cache will be out-of-sync for up to 10 minutes.
  - *Mitigation*: Implement a `CacheEvict` method in `RoleService` that can be triggered when roles are updated.
- **[Risk] Service Role Key Exposure**: Using the service role key to provision accounts poses a security risk if exposed to clients.
  - *Mitigation*: The service role key MUST remain strictly on the backend, configured via environment variables and never exposed to the client.
