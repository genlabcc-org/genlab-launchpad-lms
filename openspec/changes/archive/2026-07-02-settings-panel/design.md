## Context

GenLab Launchpad LMS has a dead ⚙️ button in the top bar. User preferences (`theme`, `activeCrmTheme`) are currently stored in `authStore`, mixing authentication and presentation concerns (SRP violation). There is no UI for platform-level admin config, despite the backend already having a `SystemSetting` key-value store and a `PUT /api/admin/settings` endpoint. No role-based filtering of settings exists. The reference design (Zoho Invoice-style) shows a drawer with a searchable section list that links to a full-screen settings page with a left nav sidebar.

## Goals / Non-Goals

**Goals:**
- Deliver a Zoho Invoice-style Settings Drawer opening from the ⚙️ button with a searchable, role-filtered section list.
- Deliver a full-screen Settings Page (`/settings/*`) with a left nav sidebar + routed content panels, exactly matching the reference screenshots.
- Migrate `theme` + `activeCrmTheme` out of `authStore` into a new dedicated `settingsStore` (SRP).
- Implement five settings sections: A (Appearance), B (Account), C (Platform/Org — admin only), E (Accessibility), F (Security — read-only).
- Add `GET /api/admin/settings` to the backend to complement the existing `PUT`.
- All sections are role-gated: admin gets A+B+C+E+F, mentor gets A+B+E+F, student gets A (theme only) + B (read-only).
- Strictly adhere to SOLID, KISS, and DRY throughout.

**Non-Goals:**
- Section D (Notifications) — no backend notification system exists yet. Stubbed as a future item.
- Section F Security actions — change password and sign out all devices are read-only stubs.
- Server-side storage of personal preferences (theme, density, accessibility) — localStorage only.
- New component libraries outside Hero UI + existing stack.

## Decisions

### D1 — settingsStore replaces authStore preference state (SRP)
`authStore` is strictly authentication state: `isAuthenticated`, `userRole`, `userId`, `email`, `phone`, `currentPath`, session actions. `settingsStore` owns all preferences: `theme`, `activeCrmTheme`, `density`, `accessibility`, and `platformConfig`. All existing consumers of `theme`/`activeCrmTheme` in `authStore` are updated to use `useSettingsStore()`. This satisfies SRP and OCP — new preference settings can be added to `settingsStore` without touching auth logic.

### D2 — Full-screen takeover route at `/settings/*`
When the user navigates to any settings section, the entire viewport is taken over by the settings layout (`SettingsPage.tsx`). The GenLab sidebar and top header bar are hidden. This is enforced by placing `/settings` outside `DashboardContainer`'s route tree. A `SettingsLayout` component wraps all section routes, providing the left nav sidebar + main content area. This follows SRP: `DashboardContainer` is not responsible for settings rendering.

### D3 — Settings Drawer is a pure navigation surface (no logic)
`SettingsDrawer.tsx` is a View Layer component only. It holds a local search string state, renders a filtered list of section items (using `SETTINGS_SECTIONS` constant filtered by role), and navigates via `useNavigate`. No business logic or store writes happen inside the drawer. This satisfies SRP and keeps the drawer thin.

### D4 — `SETTINGS_SECTIONS` registry is the single source of truth (DRY)
A single constant array `SETTINGS_SECTIONS` in `settings.config.ts` defines every section: `{ id, label, icon, route, roles[] }`. Both the `SettingsDrawer` and the `SettingsNav` left sidebar consume this same registry. Role filtering is done via a pure utility function `filterSectionsByRole(sections, role)`. No section list is duplicated.

### D5 — Backend: extend existing endpoint (KISS)
Rather than creating a new typed resource, `GET /api/admin/settings` is added to return `Map<String, String>` — symmetric with the existing `PUT`. `SettingsService.getSettings()` fetches all rows from `system_settings_t`. No new entity, no new DTO — the key-value contract is sufficient for platform config. This follows KISS and DRY (reuse `SystemSetting` entity as-is).

### D6 — Section C (Platform) frontend uses optimistic update + save button (UX)
`PlatformSettings.tsx` holds local draft state. The user edits fields and clicks "Save". On save, `settingsStore.savePlatformConfig()` calls `PUT /api/admin/settings` via the API layer. On mount, it calls `GET /api/admin/settings` to hydrate. This keeps the component clean (OCP) and avoids live-write-on-change complexity.

### D7 — 3-Layer Architecture strictly maintained
- **API Layer** (`settingsApi.ts`): Axios calls to `GET /api/admin/settings` and `PUT /api/admin/settings`. No state, no UI.
- **Data Layer** (`settingsStore.ts`): Zustand store. Owns state, calls API layer, persists to localStorage.
- **View Layer** (`SettingsDrawer.tsx`, `SettingsPage.tsx`, section components): Hero UI components. Reads from store, dispatches store actions. No direct API calls.

### D8 — Hero UI components throughout (no custom primitives)
The settings drawer uses `Drawer` (Hero UI). The settings page left nav uses `ListBox` + `ListBox.Item`. Section forms use `Switch`, `Select`, `RadioGroup`, `Input` from Hero UI. Lucide icons for section icons. No new UI library introduced.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| `authStore` migration breaks existing consumers | Grep all `theme` / `activeCrmTheme` usages before removing — update in the same task |
| Settings page route placement outside `DashboardContainer` | Handled in `App.tsx` routing — `/settings/*` is a sibling route to the dashboard routes, wrapped in its own `SettingsLayout` |
| Backend `GET /api/admin/settings` returns all keys including sensitive ones | Only non-sensitive platform config keys are stored in `system_settings_t` — no auth tokens or secrets |
| Platform config form fields are open-ended strings | Section C fields are validated client-side before save; backend stores as-is (key-value) |
