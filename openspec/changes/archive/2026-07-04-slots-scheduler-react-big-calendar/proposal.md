## Why

Admins need a clear, intuitive interface to view active scheduled mentoring slots and mentor workloads. A full interactive calendar grid (such as one using `react-big-calendar`) is out of scope for the current phase. To ensure a lightweight, maintainable, and high-performance implementation that adheres to KISS and SOLID principles, we will implement a daily schedule inspector view instead of a monthly/weekly calendar grid. When the admin selects a day, they will receive a list of all active mentor slots on that day, represented as simple cards, grouped by mentor, and sorted chronologically.

## What Changes

- **Frontend Navigation & View (Admin)**: The route and component previously named "Calendar" (under the path `/admin/calendar`) will be renamed to "Schedule Inspector" (under the path `/admin/schedule-inspector`).
- **Sidebar Menu**: The sidebar menu label will be updated from "Calendar" to "Schedule Inspector", mapping to the new route.
- **Card Layout**: Selecting a date will fetch and filter the scheduled slot data for that day. Mentors with active schedules on the selected day will be listed, and their active slots will be shown as simple cards, sorted chronologically by start time.
- **Zero-Dependency Calendar**: External calendar libraries (like `react-big-calendar`) are explicitly excluded/removed from the stack to keep the bundle footprint small and comply with constraints.
- **Architecture**:
  - The frontend communicates with the database/Supabase exclusively through backend API proxy endpoints (no direct database queries from the frontend).
  - High-priority SOLID principles, KISS, and DRY will be strictly followed.
  - Component styling will leverage Hero UI, customized for both light and dark themes matching `docs/genlab-design.json`. Any custom theme styles will remain parameterized and disabled (in wait) until explicit design approval is received to enable them.

## Capabilities

### New Capabilities
- `slots-scheduler-grid`: A day-based scheduling inspector dashboard that allows administrators to select a date and view active slots grouped by mentor and sorted chronologically as simple cards.

### Modified Capabilities

## Impact

- **Frontend**: Modifies navigation structure in `SidebarNav.tsx` and routing in `App.tsx` (renaming "calendar" path to "schedule-inspector"). Modifies `AdminCalendarDashboard.tsx` (optionally renamed to `AdminScheduleInspectorDashboard.tsx`) to handle date selection, data fetching, grouping, and rendering of slots as simple cards.
- **API/Data**: Uses existing REST API endpoints (`adminApi.getAllEnrollments`, etc.) to fetch current schedules and active slot records.
- **Dependencies**: No new npm dependencies will be added. Any reference to `react-big-calendar` is removed.
