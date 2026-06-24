# supabase-smtp-configuration Specification

## Purpose
TBD - created by archiving change implement-supabase-database. Update Purpose after archive.
## Requirements
### Requirement: Supabase SMTP Settings Configuration
The SMTP module MUST configure custom SMTP server settings on the Supabase project using the `supabase_settings` resource. It SHALL use Resend (`smtp.resend.com` on port `587` with username `resend`) using the provided SMTP password and administrator email.

#### Scenario: Custom SMTP enabled
- **WHEN** the module is executed with a valid project reference, SMTP password, and admin email
- **THEN** a `supabase_settings` resource is configured with Resend SMTP settings for the specified project.

### Requirement: Toggleable Email OTP Auth
The SMTP module MUST enable or disable Email OTP signup and autoconfirm functionality based on the `enable_email_otp` boolean toggle.

#### Scenario: Email OTP enabled
- **WHEN** the SMTP module is run with `enable_email_otp = true`
- **THEN** email signup is enabled and auto-confirm is enabled in the auth configuration.

#### Scenario: Email OTP disabled
- **WHEN** the SMTP module is run with `enable_email_otp = false`
- **THEN** email signup is disabled in the auth configuration.

### Requirement: Toggleable Mobile OTP Auth
The SMTP module MUST enable or disable Mobile OTP signups and log-ins based on the `enable_mobile_otp` boolean toggle.

#### Scenario: Mobile OTP enabled
- **WHEN** the SMTP module is run with `enable_mobile_otp = true`
- **THEN** SMS OTP is enabled in the auth configuration.

#### Scenario: Mobile OTP disabled
- **WHEN** the SMTP module is run with `enable_mobile_otp = false`
- **THEN** SMS OTP is disabled in the auth configuration.

### Requirement: Production API and Rate Limit Config
The SMTP module MUST configure production rate limits and API gateway parameters (schemas: `public,storage,graphql_public`, max rows: `1000`) in `supabase_settings`.

#### Scenario: Production settings applied
- **WHEN** the SMTP module is initialized
- **THEN** rate limits for emails, OTPs, verification, token refreshes, and anonymous users are set to production-grade thresholds, and database schema search paths are configured.

