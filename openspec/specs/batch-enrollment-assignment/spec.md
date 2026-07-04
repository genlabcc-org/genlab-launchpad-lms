# Spec: Batch Enrollment & Assignment

## Purpose
Introduce support for cohort-based batch entities, visual slot capacity grids for bulk student assignment with hard limits and snapped end dates, decoupled student onboarding, and FTUX setup checklists.

## Requirements

### Requirement: Student decoupled onboarding
Admins should be able to register/onboard a student with just a name, email, phone, and interested course. Mentor, slot, and start/end dates must be optional during onboarding.

#### Scenario: Onboard student with interested course only
- **WHEN** Admin submits the onboarding form with only Student details and Course selected (leaving Mentor and Slot blank)
- **THEN** A Student record is created with `interestedCourseId` set.
- **THEN** A pending Enrollment record is created with `mentorScheduleId` set to NULL and status set to `PENDING`.

---

### Requirement: Cohort Batch Entity
Introduce a proper `Batch` entity that acts as a lookup for cohort scheduling. Each batch has a user-friendly primary key string (e.g. `2026_july_batch_1`), start date, and optional cutoff date.

#### Scenario: Create a new batch
- **WHEN** Admin creates a batch manually with name `2026 July Batch 1` and start date `2026-07-01`
- **THEN** A record is inserted into `batches_t` with primary key ID `2026_july_batch_1` and start_date `2026-07-01`.

---

### Requirement: Hard capacity limits in slots scheduling
Capacity checks must enforce the limits:
1. `max_student_per_slot_per_mentor` (default: 12)
2. `max_student_per_slot_all_mentor_all_course` (default: 40)
These settings must be configurable via the Platform Settings UI and persist to `system_settings_t`.

#### Scenario: Exceeding mentor slot capacity
- **WHEN** Admin attempts to assign a student to a slot/mentor combination that already has 12 active enrollments
- **THEN** The backend returns a bad request capacity validation error.
- **THEN** The frontend Slot Grid disables the slot-mentor cell and prevents assignment.

---

### Requirement: Snipped end-date calculation
When bulk assigning students, the end date must snap to either the 15th or the last day (30th/31st) of the month, based on the Batch's start date and the Course's duration.

#### Scenario: Snapping computed end date to the end of the month
- **WHEN** A batch starts on `2026-07-01` and the course duration is 90 days
- **THEN** The computed end date is `2026-09-29`
- **THEN** The snapped end date is rounded up to `2026-09-30` (the end of the month).

#### Scenario: Snapping computed end date to the 15th of the month
- **WHEN** A batch starts on `2026-07-15` and the course duration is 90 days
- **THEN** The computed end date is `2026-10-13`
- **THEN** The snapped end date is rounded up to `2026-10-15` (the 15th of the month).

---

### Requirement: Visual capacity grid and bulk assignment
The Admin should have a student-centric bulk assignment interface to select pending students, see a mentor x slot capacity matrix, and assign them in a single transaction.

#### Scenario: Preview bulk assignment
- **WHEN** Admin filters student list by "PENDING" and Course, selects 3 students, and clicks a cell in the capacity grid
- **THEN** A real-time preview panel displays: "Assigning 3 students to Priya Sharma in the 10:00 AM slot. Period: 2026-07-01 to 2026-09-30. Confirm?"
- **THEN** Clicking confirm calls the backend `/bulk-assign` endpoint to update the selected students' enrollments.

---

### Requirement: Cohort Operations Navigation
The left sidebar navigation must display **Batches** and **Scheduling** as first-class sections. The Scheduling section replaces raw "Slots" configuration as the primary scheduling workspace.

#### Scenario: Navigating sidebar sections
- **WHEN** Admin views the sidebar
- **THEN** They see the "Overview" containing `Home`, "Directory" containing `Students`, `Mentors`, and `Courses`, "Operations" containing `Batches` and `Scheduling`, and "Financials" containing `Payments`.
- **THEN** Clicking `Scheduling` opens the visual grid assignment hub.

---

### Requirement: First-Time User Experience (FTUX) Setup Checklist
When the system has no data, instead of displaying empty charts or generic warnings, the system must display an interactive walkthrough checklist that guides the admin through setting up their workspace.

#### Scenario: Interactive empty-state checklist
- **WHEN** Admin visits the Home page and there are zero Slots, Courses, Mentors, Batches, or Students in the database
- **THEN** An interactive setup list is rendered:
  - 1. Set up your learning Slots (checked/unchecked based on database count)
  - 2. Define your first Course (checked/unchecked based on database count)
  - 3. Onboard a Mentor (checked/unchecked based on database count)
  - 4. Create your first Batch (checked/unchecked based on database count)
  - 5. Onboard your first Student (checked/unchecked based on database count)
- **THEN** Each item has a direct link/action button directing the admin to the correct form to create that resource.
