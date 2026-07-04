## Context

Currently, student onboarding acts in a single-phase synchronous transaction where the student registration, course selection, mentor assignment, slot assignment, and payment details are bound together. The system fails to support early onboarding/interest registration where the student is registered for a course but has no assigned slot or mentor.

Additionally, capacity limits are hardcoded, and batches are computed by checking a hardcoded boundary (July 15). We are decoupling the onboarding process and promoting batches to database entities, with visual capacity selection.

Furthermore, a first-time user entering the portal is faced with a cold-start experience. We will introduce sidebar enhancements, a structured user onboarding journey, and an interactive FTUX checklist.

## Goals / Non-Goals

**Goals:**
- Decouple Student registration from immediate Mentor/Slot assignment.
- Persist a new `Batch` table mapping cohort metadata (start date, cutoff date).
- Support Course duration configurations in days to automatically resolve end dates.
- Create a visual Slot Availability Grid showing live mentor x slot capacity data.
- Support bulk assignment of pending students using a transactional endpoint.
- Snap computed end dates based on the cohort's start date (1st vs 15th alignment).
- Enforce hard capacity validations for both mentor-slot and total-slot limits.
- Update the sidebar structure to group Directory, Operations, and Financials.
- Create an interactive FTUX Setup Checklist for new workspaces.

**Non-Goals:**
- Real-time WebSockets synchronization of slot capacity. Polling or refresh on load is sufficient.
- Automatic rescheduling of active students if a batch's start date is modified.
- Full student-portal scheduling changes; this change is scoped strictly to the Admin dashboards.

## Decisions

### 1. Database Schema Additions and Migrations
- **Batch Table**: Primary key will be the formatted string ID (e.g. `2026_july_batch_1`) to match formatting requests and align cleanly with the existing VARCHAR columns in `mentor_schedules_t` and `enrollments_t`.
- **String migrations**: Existing values in `mentor_schedules_t` and `enrollments_t` will be trimmed, lowercased, and spaced replaced with underscores (e.g. `'JULY BATCH 1'` -> `'2026_july_batch_1'`).

### 2. Decoupled Onboarding Lifecycle
- Onboarding a student with just a course saves `interestedCourseId` on the student. It creates an `Enrollment` with `mentorSchedule = null` and `status = PENDING`.
- This ensures the student is tracked in standard enrollment queries but indicates they do not have an active schedule.

### 3. Date Snapping and Rounding Algorithm
Given `batch.startDate` and `course.durationInDays`:
1. Calculate raw end date: `rawEndDate = batch.startDate + course.durationInDays`.
2. Determine rounding target:
   - If `batch.startDate`'s day-of-month is 1, the target day is the last day of the raw end date's month.
   - If `batch.startDate`'s day-of-month is 15, the target day is the 15th of the raw end date's month.
3. Always round UP (towards the future) to guarantee students get at least their course duration.

### 4. Bulk Assignment API Transaction
- A single `POST /api/admin/enrollments/bulk-assign` endpoint will be created.
- It validates the total and mentor slot capacity for the selected slot and date range.
- It finds or implicitly creates the `MentorSchedule` for that batch/course/mentor/slot.
- It updates the pending enrollments for all selected students, setting the `mentorSchedule` and changing their status to `ACTIVE`.

### 5. Sidebar Restructuring
The left sidebar will be reorganized into semantic sections to match operational workflows:
- **Overview**: Home
- **Directory**: Students, Mentors, Courses
- **Operations**: Batches, Scheduling
- **Financials**: Payments

"Scheduling" acts as the control panel showing the availability grid, replacing raw "Slots" configuration in the daily workflow.

### 6. First-Time Setup Checklist (FTUX)
When rendering the admin dashboard, we check if the counts of key resources are 0. If they are, we render the interactive walkthrough panel:
1. **Define Slots** (Status: Completed if count > 0, else Pending) -> Action link to slots dashboard.
2. **Define Courses** (Status: Completed if count > 0, else Pending) -> Action link to courses creation.
3. **Register Mentors** (Status: Completed if count > 0, else Pending) -> Action link to mentors onboarding.
4. **Create Batches** (Status: Completed if count > 0, else Pending) -> Action link to batches dashboard.
5. **Onboard Student** (Status: Completed if count > 0, else Pending) -> Action link to student onboarding.

This visual checklist uses Hero UI panels with a step-by-step progress indicator (e.g. `2/5 Steps Complete`).

### 7. Slot Availability Grid Visual States
Cells in the Mentor x Slot matrix are color-coded based on density:
- **Green** (Available): >50% space remaining (capacity < 6/12).
- **Yellow** (Filling Fast): 1-3 seats remaining (capacity 9/12 to 11/12).
- **Red** (Full): 0 seats remaining (capacity 12/12). Cells are greyed out and disabled.
- Hovering over a cell shows a detailed tooltip outlining capacity ratios and current student name list.

## Risks / Trade-offs

- **Concurrent Bulk Assignments**: Two admins assigning students at the same time could exceed the capacity. Enforcing transaction isolation and re-validating capacity inside the transaction on `/bulk-assign` mitigates this risk.
- **Empty State Override**: Admins can dismiss the FTUX checklist to access the regular dashboard view if they want to inspect settings or menus before setup.
