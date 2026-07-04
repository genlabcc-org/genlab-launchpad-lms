## 1. Database Migrations and Schema Updates

- [x] 1.1 Create migration file `20260703140000_update_batches_and_capacity.sql` under deployments/supabase/migrations.
- [x] 1.2 Define `batches_t` table with string primary key `id`, `name`, `start_date`, `cutoff_date`, and default `created_at`.
- [x] 1.3 Add data migration script to select existing `batch_id` values, clean them to lowercase/underscores, insert into `batches_t`, update the `mentor_schedules_t` and `enrollments_t` tables, and add FK constraints.
- [x] 1.4 Add `duration_in_days` column (default 90) to `courses_t`.
- [x] 1.5 Add `interested_course_id` column referencing `courses_t(id)` to `students_t`.
- [x] 1.6 Migrate settings keys `max_students_total` -> `max_student_per_slot_all_mentor_all_course` (default 40) and `max_students_per_mentor` -> `max_student_per_slot_per_mentor` (default 12) in `system_settings_t`.


## 2. Backend Entities and Mappings

- [x] 2.1 Create Java entity `Batch.java` mapping `batches_t`.
- [x] 2.2 Update `Student.java` to map `interestedCourseId` field.
- [x] 2.3 Update `Course.java` to map `durationInDays` field.
- [x] 2.4 Update `MentorSchedule.java` and `Enrollment.java` to map their `batch` relation to the `Batch` entity instead of a raw String `batchId`.
- [x] 2.5 Update the DTOs (`StudentDto`, `EnrollmentDto`, `CourseDto`, `BatchDto`) to reflect these new schema mappings.

## 3. Backend Services and API Endpoints

- [x] 3.1 Create `BatchRepository`, `BatchService`, and `AdminBatchController` for CRUD operations on batches.
- [x] 3.2 Update `StudentService.createStudent` to support registering a student with only `interestedCourseId` and creating a pending Enrollment with null schedule.
- [x] 3.3 Create a capacity query mapping endpoint `GET /api/admin/courses/{courseId}/capacity` that calculates active overlaps for all mentors teaching the course and returns the capacity matrix.
- [x] 3.4 Update capacity validation in `StudentService.validateCapacity` to enforce the new hard limits from `system_settings_t`.
- [x] 3.5 Implement `POST /api/admin/enrollments/bulk-assign` endpoint to bulk assign students, including the date alignment/snapping logic based on course duration and batch start date.
- [x] 3.6 Create a workspace overview endpoint `GET /api/admin/overview/counts` to return count aggregates of Slots, Courses, Mentors, Batches, and Students for FTUX state detection.


## 4. Frontend State and Stores

- [x] 4.1 Update API type definitions in `app/frontend/src/api/types` to reflect `interestedCourseId`, `durationInDays`, and the new `Batch` models.
- [x] 4.2 Update `settingsStore.ts` and `PlatformSettings.tsx` to handle retrieval and saving of `max_student_per_slot_all_mentor_all_course` and `max_student_per_slot_per_mentor`.
- [x] 4.3 Update frontend api proxies in `admin.ts` to expose the new capacity, batch CRUD, FTUX counts, and bulk assignment endpoints.


## 5. Frontend Navigation and FTUX Checklist

- [x] 5.1 Re-structure `SidebarNav.tsx` to align nav items under "Overview" (Home), "Directory" (Students, Mentors, Courses), "Operations" (Batches, Scheduling), and "Financials" (Payments).
- [x] 5.2 Implement an interactive `FtuxChecklist.tsx` component that queries `/overview/counts` and renders the workspace setup progress panel.
- [x] 5.3 Connect the checklist item action buttons to launch the respective creation modal or switch active sidebar sections.


## 6. Frontend visual Scheduling Grid

- [x] 6.1 Update the Student Onboarding form in `AdminStudentsDashboard.tsx` to make Mentor, Slot, and Dates optional, passing just the course as `interestedCourseId` if left empty.
- [x] 6.2 Implement student-centric filters in `AdminStudentsDashboard.tsx` to filter by "PENDING" and Course, and add selection checkboxes to the list.
- [x] 6.3 Implement the Slot Availability Grid component rendering mentor columns by slot rows, showing live current/max capacity.
- [x] 6.4 Apply density color-coding to grid cells: Green (>50% free), Yellow (1-3 seats free), Red/Disabled (0 seats free).
- [x] 6.5 Add capacity breakdown and active student list tooltips to grid cells using `@heroui/react` Tooltip.
- [x] 6.6 Create the confirmation sidebar/preview panel displaying student details, dates, mentor, slot, and course before committing.
- [x] 6.7 Wire the Confirmation button to execute the bulk assignment API and refresh dashboard data.


## 7. Verification and Testing

- [x] 7.1 Run backend tests with `./mvnw.cmd clean test` to verify compiler safety and capacity validation.
- [x] 7.2 Write unit tests for date alignment/snapping rules and bulk assignment transaction limits.
- [x] 7.3 Run frontend tests with `vitest` to ensure component stability.
- [x] 7.4 Perform manual walkthroughs of onboarding, batch creation, and student slot assignment.
