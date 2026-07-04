## Why

Currently, student onboarding couples student registration, course selection, mentor assignment, slot assignment, and payment details in a single synchronous transaction. This prevents admins from onboarding students first (e.g., when they show interest or register early) and assigning them to a mentor and slot later (e.g., bulk assigning a batch of students once capacity and scheduling are finalized). 

Furthermore, batching is done using hardcoded logic based on dates (e.g., July 15 cutoff), and capacity limits (max students per slot/mentor) are not configurable via the UI.

Additionally, the first-time setup flow (FTUX) for a completely fresh workspace is not clearly structured. Admins need a defined onboarding checklist to guide them through creating Slots, Courses, Mentors, Batches, and finally Students. Exposing Batches and visual Scheduling directly in the sidebar will clarify these operational steps.

This change:
- Decouples student registration/onboarding from scheduling.
- Makes capacity constraints fully configurable.
- Introduces visual slot grids with hard capacity validations.
- Handles automated date calculations (with snapped boundaries) during bulk assignments.
- Exposes Batches and visual Scheduling as first-class sections in the sidebar.
- Introduces an interactive setup checklist for first-time administrators.

## What Changes

- Decouple onboarding from scheduling: Admins can onboard a student with just a course of interest.
- Create a proper `Batch` entity (id/code like `2026_july_batch_1`, name, start date, cutoff date) in the database to drive cohort tracking.
- Update `Course` to support `durationInDays` to auto-calculate enrollment end dates.
- Add support to snap computed end dates to the 15th or 30th/last day of the month based on the batch start date.
- Update capacity settings (`max_student_per_slot_per_mentor`, `max_student_per_slot_all_mentor_all_course`) to be configurable via the Platform Settings UI and enforce them as hard limits during scheduling.
- Expose **Batches** and **Scheduling** in the left navigation sidebar.
- Implement an interactive setup checklist (empty state guide) displayed when the system has zero data.
- Create a dedicated bulk assignment backend API.
- Create a visual Slot Availability Grid UI on the frontend for bulk-assigning pending students to mentor + slot combinations.

## Capabilities

### New Capabilities
- `batch-enrollment-assignment`: Core workflow capability covering student-centric batch filtering, slot availability matrix API, bulk transactional assignments, custom capacity setting configurations, cohort navigation structure, and first-time setup wizards.

### Modified Capabilities
- `settings-api-backend`: Extend settings backend API to support configuring the new capacity limits `max_student_per_slot_per_mentor` and `max_student_per_slot_all_mentor_all_course`.
- `settings-store`: Add the new platform configuration attributes to the frontend state store.
- `settings-sections`: Update PlatformSettings view to expose configuration input fields for slot and mentor capacity.

## Impact

- **Database**: Adds `batches_t` table, updates `students_t` with `interested_course_id`, updates `courses_t` with `duration_in_days`, updates `mentor_schedules_t` and `enrollments_t` to reference `batches_t(id)` via string FKs.
- **Backend APIs**:
  - `GET /api/admin/courses/{courseId}/capacity`
  - `POST /api/admin/enrollments/bulk-assign`
  - `GET/POST/PUT/DELETE /api/admin/batches`
- **Frontend Components**:
  - `SidebarNav.tsx` (adds Batches and Scheduling, replaces Slots raw configuration with Scheduling hub)
  - `AdminStudentsDashboard.tsx`
  - `PlatformSettings.tsx`
  - `settingsStore.ts`
  - `DashboardContainer.tsx` (or new components for FTUX Checklist)
- **SOLID/KISS/DRY Code Quality**: Clean decoupling of Student entity from immediate Enrollment, transactional boundary checks, and reusable grid visualization components.
- **Database/Supabase Security**: The frontend communicates with the database exclusively through backend API proxy endpoints.
