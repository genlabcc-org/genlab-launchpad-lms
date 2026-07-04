## 1. Backend Changes

- [x] 1.1 Add active enrollment course query to `EnrollmentRepository.java`
- [x] 1.2 Add `activityMetrics` list field to `CourseDto.java` DTO record
- [x] 1.3 Add weekly count calculation logic in `CourseService.java` and map to `CourseDto`
- [x] 1.4 Re-run backend compilation/tests to ensure type-safety and correct behavior

## 2. Frontend Changes

- [x] 2.1 Update the frontend `CourseDto` model structure in `models.ts` to include `activityMetrics`
- [x] 2.2 Update `CourseDetailView.tsx` to read the dynamic metrics and normalize the heights of the course activity bar chart
- [x] 2.3 Re-run frontend compilation and verify UI stability
