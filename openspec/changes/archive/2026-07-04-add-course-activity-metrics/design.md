## Context

The Course Activity component on the courses dashboard is currently populated by hardcoded data. To support real metrics, we need to extend the Course DTO on both backend and frontend, fetch the student active enrollment count on the backend, calculate it week-over-week, and send it to the frontend.

## Goals / Non-Goals

**Goals:**
- Dynamically serve course activity metrics for the last 7 weeks.
- Render dynamic heights in the frontend course activity bar chart based on actual values.
- Maintain decoupled architectures (DTO vs Entity).

**Non-Goals:**
- Tracking granular attendance or minute-by-minute session status; active student metrics are computed on a weekly basis from enrollments.
- Modifying other dashboards or other charts.

## Decisions

- **Weekly Bucket Logic**: A student counts as active in a course for a given week if their enrollment was created on or before that week, the enrollment status is 'active', and the enrollment is within the course's `durationInDays` limit.
- **DTO decouple**: Avoid modifying the database `Course` table structure. Instead, compute activity metrics in `CourseService.java` using `EnrollmentRepository` and map it into `CourseDto` records.
- **Frontend scaling**: In the frontend, the height of each bar is determined by dividing the week's count by the maximum count in the 7-week period.

## Risks / Trade-offs

- **Performance**: Fetching and processing enrollments in memory for each course lookup could be slow if there are thousands of enrollments.
- **Mitigation**: The current volume is low. For higher scale, we would define a database-level query or cache the results, but in-memory stream operations satisfy the KISS principle for the current project scale.
