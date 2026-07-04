## 1. Build Shared UI Directory Primitives

- [x] 1.1 Create `DirectoryLayout.tsx` under `components/dashboards/shared/directory/` to handle list/split screen layout states.
- [x] 1.2 Create `DirectoryHeader.tsx` to handle search inputs, active filter dropdowns, counts, and action slots.
- [x] 1.3 Create `DirectoryTable.tsx` to style administrative tables, selection checkboxes, and sort headers.
- [x] 1.4 Create `DirectoryPagination.tsx` to handle items per page and page number selectors.
- [x] 1.5 Move `StatusBanner` and `Accordion` from `courses/shared.tsx` to the shared directory components.

## 2. Refactor Courses Dashboard

- [x] 2.1 Clean up `courses/shared.tsx` and re-export `StatusBanner` and `Accordion` from the shared components.
- [x] 2.2 Refactor `courses/CatalogListView.tsx` to use `DirectoryHeader`, `DirectoryTable`, and `DirectoryPagination`.
- [x] 2.3 Refactor `courses/CourseDetailView.tsx` to use `DirectoryLayout` / `DirectorySplitLayout`.

## 3. Implement Students Dashboard

- [x] 3.1 Extract fallback student data from `AdminStudentsDashboard.tsx` to a new `studentFallbacks.ts` data module.
- [x] 3.2 Create `hooks/useAdminStudents.ts` to manage loading states, student list, active details, filters, and api calls.
- [x] 3.3 Create `StudentListView.tsx` to render the student directories table.
- [x] 3.4 Create `StudentDetailView.tsx` to display split detailed card overlays and inline edits.
- [x] 3.5 Create `StudentFormView.tsx` to onboard new students.
- [x] 3.6 Integrate `useAdminStudents` hook into `AdminStudentsDashboard.tsx` to control sub-views.

## 4. Implement Mentors Dashboard

- [x] 4.1 Create `hooks/useAdminMentors.ts` to manage mentor directories, state, and CRUD API operations.
- [x] 4.2 Create `MentorListView.tsx` to display registered mentors.
- [x] 4.3 Create `MentorDetailView.tsx` to show detail sidebar slots.
- [x] 4.4 Create `MentorFormView.tsx` to onboard new mentors.
- [x] 4.5 Connect `useAdminMentors` inside `AdminMentorsDashboard.tsx`.

## 5. Verify Build and Output

- [x] 5.1 Run `npx tsc --noEmit` in `app/frontend` to verify that there are no compilation or type validation errors.
