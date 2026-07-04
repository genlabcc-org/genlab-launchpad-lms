## Why

Currently, the course activity bar chart in `CourseDetailView.tsx` displays static, hardcoded metrics (`[30, 45, 35, 50, 65, 70, 85]`). This does not reflect real active student learning activity for the selected course track. To make the dashboard functional and data-driven, we need a dynamic backend integration that queries actual active student enrollments grouped by week over the past 7 weeks.

## What Changes

- **Backend API**: Extend the `CourseDto` to include an `activityMetrics` integer list field, and implement service logic to compute weekly active student enrollments for a course.
- **Backend Service & Repository**: Introduce a query in `EnrollmentRepository` and calculation logic in `CourseService` to count active enrollments.
- **Frontend client**: Extend type definitions to support `activityMetrics` and replace the hardcoded array in the course detail activity chart with the dynamic API metrics.
- **SOLID/KISS/DRY Adherence**: Maintain high priority for SOLID principles (e.g., single responsibility for query and computation logic), KISS (simple week-based calculation in memory), and DRY (using clean common structures).
- **Communication Security**: Confirm that the frontend communicates with the database/Supabase exclusively through backend API proxy endpoints.
- **Styling**: Component styling uses Hero UI customized for both light and dark themes matching `docs/genlab-design.json` (parameterized and disabled in wait for explicit design approval).

## Capabilities

### Modified Capabilities
- `course-management`: Update course catalog representation to include dynamic activity metrics for selected tracks.

## Impact

- **Affected Code**: `CourseDto.java`, `CourseService.java`, `EnrollmentRepository.java`, `CourseDetailView.tsx`, `models.ts`
- **APIs**: The Course retrieval endpoints (`GET /api/admin/courses` and `GET /api/admin/courses/{id}`) will now return `activityMetrics` as a list of integers.
- **Dependencies**: No external libraries added.
