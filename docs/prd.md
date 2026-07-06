# Product Requirements Document (PRD) - GenLab Launchpad LMS

## 1. Functional Requirements & User Stories

### 1.1. Account Provisioning & Authentication
- **Admins (HRs)** can create new user logins (both Student and Mentor roles).
- **Students** log in via a phone-based OTP verification screen.
- **Mentors** and **Admins** log in using secure email authentication.
- Configurable **30-day session lifetime** enforced on both backend token generation and frontend storage expiration.

### 1.2. Student Management
- **Single Admin Student Onboarding Form**: Admins/HRs onboard new students by filling out a single, comprehensive creation form containing:
  - **Personal Details**: Name, Gender, Email, Mobile numbers (personal contact number + parent/spouse emergency contact number), Full physical address, Address proof file upload (Aadhar card or Driving License image, stored and retrieved via AWS S3), Profile photo image file upload (stored and retrieved via AWS S3).
  - **Academic/Career Status**: Institution details (School, College, Institute, or Company name), Student Type dropdown (Currently studying - Student, Finished studies - Fresher, or Professional).
  - **Referral Details**: Referral source dropdown (Direct, School, Existing Student, College, or Other/Something else).
  - **Course & Slot Assignment**: Registered course catalog assignment, Assigned mentor selection, Assigned customizable time slot selection, Onboarding/Course Start Date and End Date.
  - **Payment & Agreement**: Payment Type selection (Full upfront payment, or Partial split option - monthly or total half split in two installments), terms and conditions agreement verification checkbox.
- **Attendance Tracking**: Enable admins to log and audit session attendance profiles.
- **One-Click Certificate Issuance**: Allow Admins/HRs to generate and distribute official course completion certificates automatically with a single click upon successful completion.

### 1.3. Course Catalog
- CRUD capabilities on courses for Admins.
- Assign active modules and tracks to students.
- Display custom learning journeys on the student portal.

### 1.4. Slot & Calendar Management
- Custom scheduler and calendar dashboard.
- Admins can assign appropriate mentors to available student slots.
- Mentors and students can view their respective calendar slots.
- **Customizable Slot Durations**: Admins can customize slot timings (defaults: 10am-12pm, 2pm-4pm, 4pm-6pm) and dynamically add new slots to the scheduler.
- **Schedule Inspector**: A dedicated daily operational hub item under **OPERATIONS** displaying active mentoring slots grouped by mentor and sorted chronologically as interactive cards.
  - **Date Picker & Sync Controls**: Features a native date picker (`DD-MM-YYYY`, e.g. `06-07-2026`) and manual sync/refresh icon button in the page header to inspect specific date allocations.
  - **Backend Connection Alert**: Displays a high-visibility pink alert banner (`Failed to connect to the backend server to retrieve schedule details.`) if the Spring Boot REST backend server is disconnected or unreachable.
  - **Empty State Card**: Renders a centered empty state component (`No Active Slots Found` - `There are no active student enrollments scheduled for the date YYYY-MM-DD.`) when no slot allocations exist for the selected date.
  - **Active Day Filtering**: Client-side filtering selects enrollments and schedules where `startDate <= selectedDate && endDate >= selectedDate`.
  - **Data Flow**: Axios API Layer → Zustand/State → filtering, grouping, and chronological sorting → simple card rendering.

### 1.5. Payment Tracking
- Audit panel for manually logging student course fees.
- Update payment statuses (e.g., Pending, Paid) manually by Admins.

### 1.6. Enrollment Management
- **Enrollments CRUD**: Admins can list, retrieve, create, update, and delete any student enrollment (slot assignment).
- **Bulk Enrollment**: Admins can enroll multiple students at once through a bulk enrollment request.

---

## 2. Interface Layout & Sidebar Menu Mappings
The dashboard UI features a dark left sidebar with **GenLab (The Next Creation Space)** header branding, a bottom `Collapse <<` toggle button, a top header bar, and a central workspace panel. Sidebar menu items are organized under four main category groups:

| Category Group | Sidebar Item | Mapped Route | Role Functionality |
| :--- | :--- | :--- | :--- |
| **OVERVIEW** | **Home** | `/admin/dashboard` | Top-level analytics dashboard displaying key business metrics, student stats, active courses, and payments overview. |
| **DIRECTORY** | **Students** | `/admin/students` | Directory of enrolled students, academic profiles, contact records, and single admin onboarding creation form. |
| **DIRECTORY** | **Courses** | `/admin/courses` | Course catalog definitions, active curriculum modules, and fee structure configuration. |
| **DIRECTORY** | **Mentors** | `/admin/mentors` | Directory and profile management for registered mentors (`*.genlab@gmail.com`). |
| **OPERATIONS** | **Batches** | `/admin/batches` | Creation and management of course batches, assigning mentors and slot timings. |
| **OPERATIONS** | **Slots** | `/admin/slots` | Custom slot timing presets (10am-12pm, 2pm-4pm, 4pm-6pm) and scheduler settings. |
| **OPERATIONS** | **Scheduling** | `/admin/scheduling` | **Core Operational Engine.** Assigning and coordinating schedule allocations between students, batches, mentors, and slot timings. |
| **OPERATIONS** | **Schedule Inspector** | `/admin/schedule-inspector` | **Core Daily Hub.** Displays active slots grouped by mentor, date picker controls, refresh action, backend connection error banner, and empty state handling. |
| **FINANCIALS** | **Payments** | `/admin/payments` | Auditing, tracking, and manual status updating of student course fee records. |

---

## 3. Non-Functional Requirements

### 3.1. Design Aesthetics & Theming
- Centralized theme customization using **Hero UI** component library.
- **GenLab branding is always active by default.** The `.genlab-theme` CSS class is unconditionally applied at app startup — there is no user-facing toggle.
- All custom styling parameters (colors, typography, borders, spacings) from `docs/genlab-design.json` are permanently active and must not be disabled or gated behind a flag.

### 3.2. Performance Constraints
- Cached role lookups to minimize DB latency.
- Indexed database search columns.
- Optimized RLS policies (wrapping user id queries in subqueries).

### 3.3. Session Configuration
- Enforce session timeout settings (default 30 days) parameterized in a single config file on both backend and frontend layers.

### 3.4. CI/CD & Cloud Infrastructure
- **Infrastructure Tools**: Terraform 1.5.0 for environment orchestration and AWS resource management.
- **Compute & CDN Services**: AWS EC2 (backend), S3 and CloudFront CDN (frontend hosting). Parameterized by an `enable_web_hosting` variable to toggle between bucket hosting (mapping to `cdn.domain_url`) and website hosting (mapping to the apex and `www.domain_url`).
- **Secrets Management**: Dynamic secrets retrieval from AWS Secrets Manager `/config/genlab-launchpad-lms-api_<env>`.
- **Deploy Automation**: Ansible playbooks for server setup and host deployments; Supabase CLI for database schema migrations.
- **Workflow Runner**: GitHub Actions pipelines (`.github/workflows/infra-deploy.yml`) resolving targeted branches (dev, staging, prod) and orchestrating deployment cycles. For automated push events, jobs execute conditionally (backend deploys only if `app/backend/` changes, frontend deploys only if `app/frontend/` changes, and Supabase migrations deploy only if `deployments/supabase/` changes); manual triggers (`workflow_dispatch`) force deploy all components.
