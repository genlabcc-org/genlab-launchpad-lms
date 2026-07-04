## Context

Currently, the LMS has an active Courses directory dashboard, but the Students and Mentors directories are represented by placeholder/mock components. To ensure visual consistency and high maintainability, we will build a reusable Directory UI Primitives library under `components/dashboards/shared/directory/`. 

## Goals / Non-Goals

**Goals:**
- Centralize styling of the master-detail split screens, Odoo-style headers, list tables, and pagination widgets.
- Implement highly responsive split-pane drawers to detail-view selected items without page reloads.
- Fully implement Student and Mentor CRUD (Create, Read, Update, Delete) directories that match this visual structure.
- Adhere to the Single Responsibility Principle: custom hooks control state/APIs, while visual primitives render layouts.

**Non-Goals:**
- Modifying other dashboards like Payments, Batches, or Slots.
- Enabling the customized Hero UI styling for light/dark themes until explicit design approval is received.
- Introducing alternative charting or event calendars other than react-big-calendar.

## Decisions

- **Approach B (Primitives Library)**: Instead of a single giant generic component schema, we extract layout primitives. This allows each dashboard (`StudentListView`, `MentorDetailView`, etc.) to control its own custom columns and inputs without complex type mapping.
- **REST proxy APIs**: Every dashboard continues proxying database requests strictly via Spring Boot endpoints defined in `adminApi`.
- **Parameterizing Themes**: All Hero UI and Tailwind customizations are parameterized and disabled in wait state.

## Risks / Trade-offs

- **Slightly More Boilerplate**: Each dashboard orchestrator needs to import and wire hook states into `<DirectoryHeader>` and `<DirectoryTable>`. This is a tradeoff we accept to maintain simple, easy-to-read code (**KISS**) over a single dense generic controller.
