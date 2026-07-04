## ADDED Requirements

### Requirement: Admin Day Selection and Schedule Inspector
The Admin schedule dashboard must allow administrators to select a date and see a comprehensive inspector view of all active slots on that day, grouped by mentor and sorted chronologically as simple cards.

#### Scenario: Admin views active slots for a specific day
- **WHEN** the admin accesses the Schedule Inspector page and selects a date (defaults to the current local date)
- **THEN** the application fetches all active student enrollments and mentor schedules
- **AND** filters the list to include only schedules where `startDate <= selectedDate` and `endDate >= selectedDate`
- **AND** groups these active slots by the assigned mentor
- **AND** sorts the slots for each mentor chronologically by start time
- **AND** displays each slot as a simple card containing the slot timings (12-hour format), duration, course title, list of enrolled students, and current enrollment counts.

### Requirement: Data Decoupling & Proxy Communication
The frontend must exclusively communicate with the Supabase database through backend API proxy endpoints. The frontend 3-layer architecture must be strictly followed: API Layer with Axios, Data Layer with Zustand (use existing slot/enrollment/mentor stores), and View Layer with Hero UI.

#### Scenario: Data flow via proxy
- **WHEN** the frontend requests calendar schedules
- **THEN** it executes Axios calls to backend controller endpoints (e.g. `/api/admin/enrollments` or `/api/admin/mentors/{id}/slots`)
- **AND** maps the returned API DTOs into frontend state via stores.

### Requirement: Zero External Calendar Library Dependency
No external calendar grid libraries (such as `react-big-calendar`) are to be used for the current day-view scheduling inspector. Simple card elements built with Tailwind CSS and Hero UI will represent the inspector view.

#### Scenario: Zero dependency calendar rendering
- **WHEN** rendering the active daily slot list
- **THEN** the frontend uses Tailwind CSS and Hero UI component styling for responsive layouts
- **AND** ensures all custom design tokens from `docs/genlab-design.json` are parameterized and disabled (in wait) until explicit design approval is received.
