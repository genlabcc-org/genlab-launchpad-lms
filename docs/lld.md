# Low Level Design (LLD) - GenLab Launchpad LMS

## 1. Frontend Design Layout (3-Layer Pattern)
The frontend code structure located under `app/frontend/` is divided into three distinct modules to optimize testability and maintainability:

```
src/
├── api/             # API Layer (Axios client config, endpoints, API routes definitions)
├── data/            # Data Layer (Zustand stores, state actions, selectors, local caching)
└── view/            # View Layer (Hero UI components, forms, layouts, pages, styles)
```

---

## 2. Centralized Styling & Phased Theming Configuration
- Theme configuration parameters (colors, fonts, borders, and margins) are central to the frontend.
- A central configuration file (e.g. `tailwind.config.js` or `theme.config.ts`) exports the UI values using parameters retrieved from `docs/genlab-design.json`.
- **Phased Rollout**: Initial theme config is active with default settings. Custom GenLab properties are mapped but commented out or conditionally disabled:
```javascript
// Central Theme config template
const customDesignTokens = {
  // Acid Lime Accents, Clash Display fonts, rounded cards/buttons mapping
  // Keep disabled or parameterized (in wait) until explicit design approval is received
  active: false, 
  // ...
}
```

---

## 3. Backend Implementation Layers (MVC Pattern)
The Spring Boot backend under `app/backend/` follows the Controller-Service-Repository pattern:
- **Controller Layer**: REST controllers mapping routes and request/response parsing ONLY. Business logic and validation are delegated entirely to the Service layer.
  - Security Check: `@RequiresRole` aspect checks role validation matching userRole caching.
- **Service Layer**: Handles all business logic, validation logic, transaction scopes, database validations, business operations, and cache integration.
- **Repository Layer**: Extends JPA repositories to perform database actions on tables.
- **Model Layer**: Defines persistent entity structures and DTOs (decoupled and organized into request, response subpackages, and base package for domain DTOs).
- **Properties**: Centralized `.env` or `application.yaml` session duration parameter (`30 days` / `2592000 seconds`).

---

## 4. Database Security & Performance Details

### 4.1. Row Level Security (RLS) Optimization
- Enabled on all public tables: `students_t`, `mentors_t`, `courses_t`, `user_roles_t`, `enrollments_t`.
- Queries perform better by wrapping `auth.uid()` lookup in a select subquery:
```sql
-- Efficient policy checking user mapping
CREATE POLICY "Users read own role" ON public.user_roles_t
FOR SELECT USING ((SELECT auth.uid()) = user_id);
```

### 4.2. Secure Functions and Triggers
- Helper security routines and auth triggers (such as role assignment on signup) are placed in a dedicated, hidden `internal` database schema.
- Explicitly set `search_path = public` to protect against mutable search path vulnerabilities.

### 4.3. Query Performance & Indexing
- Indexes MUST be added to all foreign keys and frequently queried fields (e.g. `students_t(phone)`, `user_roles_t(user_id)`).

### 4.4. Extended Entities Schema Mapping
- **Student Profile Table**: Extended to capture:
  - Personal: Name, Gender, Email, Address.
  - Upload assets: AWS S3 storage keys for profile photo and address proof image files.
  - Contact: Personal phone number + parent/spouse phone number references.
  - Demographic: Student Type (Student, Fresher, Professional), Institution Name, Referral Source (Direct, School, Existing Student, College, Other).
  - Configurations: Registered course, assigned mentor, custom time slot ID, start/end dates, payment type selection, and terms & conditions agreement flags.
- **Attendance Ledger**: Mappings for student session attendance records.
- **Certificates Registry**: Log tracking issued certificate file links and metadata.
- **Custom slots Table**: Stores dynamic time slot intervals (e.g., 10am-12pm, 2pm-4pm, 4pm-6pm) customizable by administrators.

---

## 5. Infrastructure & Deployment Details

### 5.1. Terraform Environment Setup
- Target environment configurations (dev, staging, prod) are declared in `deployments/terraform/environments/<env>/`.
- Frontend S3 Svelte-like hosting buckets, CloudFront CDN edge distributions, EC2 Virtual Machines, security groups, and AWS Secrets Manager secrets are mapped as modular resources.
- **S3 Asset Storage Buckets**: Mapped as modular resources in Terraform (`deployments/terraform/modules/s3_assets/`) to provision environment-specific buckets for hosting user uploaded photos and documents securely.
- **Frontend Module Toggle (`enable_web_hosting`)**: A boolean variable mapping two hosting models:
  - `false` (default for non-prod): Provisions bucket-hosting with DNS record mapped to `cdn.domain_url`.
  - `true` (default for prod): Provisions website-hosting with DNS records mapped to apex and `www.domain_url` endpoints.
- Output values (e.g., `backend_public_ip`, `backend_private_key`, `cloudfront_distribution_id`, `s3_assets_bucket_name`) are forwarded directly to subsequent workflow steps.

### 5.2. Ansible Deployment Configuration
- **Host Connection**: Executed over SSH using a dynamic Ansible inventory targeting the resolved EC2 instance IP.
- **Service Playbook** (`deployments/ansible/site.yml`):
  - Automatically provisions the necessary Java JDK runtime execution environment.
  - Registers the compiled Java JAR file as a systemd backend background service.
  - Dynamically injects environment variables fetched from Secrets Manager.
