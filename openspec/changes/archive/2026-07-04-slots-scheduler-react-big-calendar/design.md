## Context

The calendar dashboard under `AdminCalendarDashboard.tsx` is currently a placeholder block. A previous design contemplated importing `react-big-calendar` for an interactive time-grid, but to keep the implementation lightweight, simple, and dependency-free, we will build a daily Schedule Inspector. This allows administrators to inspect slot utilization for any selected day directly via a clean, simple card layout.

## Goals / Non-Goals

**Goals:**
- Replace the "Calendar" tab with a "Schedule Inspector" tab.
- Enable administrators to select a target date via a styled date selector on the "Schedule Inspector" page.
- Load all active scheduled slots for that day, grouped by mentor.
- Sort slots chronologically under each mentor's name.
- Design simple, clean cards displaying the slot details: timing preset, course name, enrolled students list, and enrollment count.
- Keep the implementation clean and modular, adhering to SOLID, KISS, and DRY design principles.
- Use only Hero UI and Tailwind CSS for rendering, customized for light/dark themes.

**Non-Goals:**
- Monthly/weekly calendar time grids.
- Usage of `react-big-calendar` or other external calendar package dependencies.
- Drag-and-drop rescheduling support.
- Custom database schema migrations or backend endpoint additions (we will leverage the existing `/api/admin/enrollments` or `/api/admin/mentors/.../slots` APIs).

## Decisions

### 1. Simple Date Input & Client-Side Filtering
Instead of pulling in heavy third-party calendar views or adding a date-specific backend search query, we will use a native HTML5 date input (`<input type="date">`) with custom Tailwind styles. We will fetch the master enrollment lists via `adminApi.getAllEnrollments()` and perform the active date filters client-side:
- **Active Filter Condition**: A slot/schedule is active on the selected date `D` if `enrollment.mentorSchedule.startDate <= D` and `enrollment.mentorSchedule.endDate >= D`.
- This is highly performant for standard cohort sizes and reduces server complexity to zero.

### 2. Grouping & Sorting Logic
We will group the filtered active enrollments client-side by mentor name (or ID) and sort the slots chronologically:
- Grouping: A helper utility `reduce` will map each active enrollment to its assigned mentor.
- Chronological Sorting: Sort active slots by their start hour and minute values (e.g. `startTime.hour * 60 + startTime.minute`).

### 3. Responsive Card Component Design
Using Hero UI's card layout and standard Tailwind CSS, we will present each mentor's daily schedule clearly as simple cards, displaying:
- Time Slot Range in 12-hour AM/PM format (e.g. "10:00 AM - 12:00 PM").
- Course name.
- Enrolled student details (names, emails) with bullet list format.
- A badge showing the duration block.

## Risks / Trade-offs

- **Client-Side Filtering Performance**: If the database grows to thousands of active students, fetching all enrollments client-side would require pagination or server-side date query parameters. For GenLab's scale, the standard cohort sizes (dozens to hundreds of active student slots) make this a non-issue and client-side filtering provides a highly responsive, zero-latency interface.
