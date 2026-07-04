## 1. Backend

- [x] 1.1 Verify `/api/admin/enrollments` endpoint returns active enrollments with their linked `student` and `mentorSchedule` (including slot timings and mentor details).

## 2. Frontend Data & Helper Layer

- [ ] 2.1 Add a utility function to format time objects to a 12-hour format string (e.g. `10:00 AM - 12:00 PM`).
- [ ] 2.2 Add a client-side filter helper to check if a schedule is active on a selected date: `startDate <= selectedDate && endDate >= selectedDate`.
- [ ] 2.3 Add grouping logic to collect active slot records by the assigned mentor's name and sort them chronologically by start time.

## 3. Frontend View Layer (Admin Schedule Inspector Dashboard)

- [ ] 3.1 Rename `AdminCalendarDashboard.tsx` to `AdminScheduleInspectorDashboard.tsx` (and update corresponding imports in `App.tsx`).
- [ ] 3.2 Update `SidebarNav.tsx` to change the navigation label from "Calendar" to "Schedule Inspector" and link to path `/admin/schedule-inspector`.
- [ ] 3.3 Update `AdminScheduleInspectorDashboard.tsx` to include a date selection input with a default value of today's date.
- [ ] 3.4 Implement a fetch cycle to retrieve all enrollments on component mount using `adminApi.getAllEnrollments()`.
- [ ] 3.5 Apply date-based filtering, group active schedules by mentor, sort chronologically, and render grouped schedules using simple Hero UI cards.
- [ ] 3.6 Implement user-friendly loading states, error handling, and clean empty states for days with no scheduled slots.
