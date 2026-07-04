## Why

Currently, the Courses, Students, and Mentors administrative directory views in the LMS are fragmented:
- **Courses**: Fully implemented with custom directory layouts, forms, list tables, and detail screens.
- **Students**: Replaced with a basic visual construction placeholder.
- **Mentors**: Implemented as a simple static text mock.

To ensure a cohesive and easy-to-use user experience, we need to unify the user interface across all three entity directories. From a developer perspective, we need to design a highly maintainable, extensible, and scalable shared visual primitives library following strict engineering guidelines.

## What Changes

We will introduce a shared, generic UI directory component library under a centralized namespace (`dashboards/shared/directory`). This will include:
- `DirectoryLayout`: Controls the split-pane list vs. detail structure.
- `DirectoryHeader`: Centralizes Odoo-style search, filtering, and bulk action triggers.
- `DirectoryTable`: Provides standard table styling, multi-selection checkboxes, column setups, and sorting headers.
- `DirectoryPagination`: Consolidates paging logic and controls.

We will refactor the Courses dashboard to utilize these new layout primitives and then build the Students and Mentors dashboards on top of them. 

All implementations will strictly adhere to the following principles:
1. **SOLID** (High Priority): Single Responsibility (separate hook, view, and layout layers), Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.
2. **KISS**: Avoid over-engineered abstractions. Provide flexible, configuration-friendly visual slots.
3. **DRY**: Share common styles, filters, search toolbars, and pagination footers without repeating logic.
4. **Backend Security**: All frontend communications with the database/Supabase will run exclusively through backend REST API proxy endpoints.
5. **Styling & Theming**: Component styling uses Hero UI and Tailwind CSS matching the designs defined in `docs/genlab-design.json`. Theme customization changes will remain parameterized and disabled (in wait) until explicit design approval is received to enable them.

## Capabilities

### New Capabilities
- `student-directory`: Full student management list, detailed edit panel, and new student onboarding forms.
- `mentor-directory`: Full mentor management directory, active schedules, and mentor creation flow.

### Modified Capabilities
- `course-management`: Refactoring the course list, details, and forms to run on the shared directory component primitives.

## Impact

- **Frontend Components**: Modifies `AdminStudentsDashboard.tsx`, `AdminMentorsDashboard.tsx`, `AdminCoursesDashboard.tsx`, and files under `components/dashboards/courses/`. Introduces files under new directories `components/dashboards/shared/directory/`, `components/dashboards/students/`, and `components/dashboards/mentors/`.
- **Frontend Hooks**: Introduces `hooks/useAdminStudents.ts` and `hooks/useAdminMentors.ts`.
- **API integration**: Integrates backend REST endpoints in `adminApi` for students and mentors.
