# Business Requirements Document (BRD) - GenLab Launchpad LMS

## 1. Project Overview & Business Objectives

### 1.1. Business Drivers & Problem Statement
The current system used to manage students, courses, slots, and payments is extremely inefficient to scale and manage. To address this, the company is building a custom-tailored Learning Management System (LMS). This solution is designed to:
- Streamline operations, student management, manual revenue tracking, and business analytics.
- Establish highly efficient, simplified processes that require less manual effort.
- Increase employee efficiency and overall job satisfaction by providing a centralized tool custom-built for their workflows.

### 1.2. Core Features
The platform is designed to:
- Manage course student registrations and course allocations.
- Manage and coordinate schedules (slots) between course students and available mentors.
- Provide a custom calendar/scheduling view for managing these slots.
- Track student payments and fees manually.
- Enable students to view their course progress and learning journeys.

---

## 2. Target Users & Access Roles
The platform defines three distinct user profiles, each with its own level of access:

### 2.1. Admin (HRs)
- **Authentication**: Email-based login, restricting registrations to emails ending with `@genlab.cc`.
- **Privileges**:
  - Full platform administrative controls.
  - Onboard and provision logins for both Mentors and Students (collecting full personal, career, referral, and payment configurations).
  - Create and manage course students, course assignments, and profile metadata.
  - Track and audit student session attendance.
  - Generate and distribute official completion certificates on a single click.
  - Track payments manually (log receipts, update status, audit fee records).
  - Manage mentor registrations, slot allocations, and customize/add slot timings.
  - View central platform metrics and analytics.

### 2.2. Mentor
- **Authentication**: Email-based sign-in, restricting registrations to emails ending with `.genlab@gmail.com`.
- **Privileges**:
  - View assigned mentoring slots and schedule calendars.
  - Review student profiles assigned to their slots.
  - Record feedback and update status on active slots.
  - *No self-registration*; logins must be provisioned by Admins (HRs).

### 2.3. Student
- **Authentication**: Phone-only OTP sign-in.
- **Privileges**:
  - View assigned courses and curriculum progress.
  - Check active slot schedules and upcoming mentor sessions.
  - Track personal learning journeys.
  - Review fee payment status history.
  - *No self-registration*; logins must be provisioned by Admins (HRs).

---

## 3. Scope & Access Restrictions
- **Self-Registration Constraint**: No self-registration is allowed for Students or Mentors. All user accounts must be provisioned explicitly by an Admin (HR).
- **Session Lifetime**: For security and ease of use, user sessions last exactly **30 days** across both the frontend and backend layers. This value is configurable in a single location on each side.
- **Theme Activation Phase**: The initial deployment will start with the default layout/theme. Custom styling tokens (Lime primary accents, dark/light theme customizations) must be defined in the central config but kept disabled (in wait) until explicit design approval is received.
- **Deployment & Hosting**: Hosted on Amazon Web Services (AWS) in the `ap-south-1` region. Core compute (backend EC2), static hosting (frontend S3/CloudFront), and asset storage buckets (for profile photos and address proof image uploads) are provisioned via Terraform, configured using Ansible, and orchestrated automatically via GitHub Actions pipelines.
