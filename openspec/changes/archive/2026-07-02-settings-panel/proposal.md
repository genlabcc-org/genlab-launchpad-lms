## Why

The GenLab Launchpad LMS currently has no organized settings surface. User preferences (theme, CRM skin) are buried in `authStore` — mixing authentication concerns with UI preferences — violating SRP. There is no dedicated UI for platform-level configuration (org name, payment methods, slot presets), even though the backend already has a `SystemSetting` entity and a `PUT /api/admin/settings` endpoint ready to use. The Settings gear icon in the top bar is a dead button. This change delivers a complete, role-aware settings system.

## What Changes

- A **Settings Drawer** (Zoho Invoice-style) opens from the ⚙️ button in the top bar. It shows a searchable list of sections filtered by role, plus an "All Settings" link that navigates to the full settings page.
- A **full-screen Settings Page** (`/settings/*`) takes over the entire viewport (hiding the main sidebar + top bar) with its own left nav sidebar and main content panel — matching the second reference screenshot exactly.
- **`settingsStore`** (new Zustand store) is created, owning all preferences: theme, CRM skin, density, accessibility prefs, and platform config. `authStore` is refactored to remove `theme` and `activeCrmTheme` (SRP compliance).
- **`GET /api/admin/settings`** is added to the backend to complement the existing `PUT` — allowing the frontend to fetch platform config on page load.
- All settings sections are **role-gated**: admin sees all, mentor sees A/B/E/F, student sees A (theme only) + B (read-only).

## Capabilities

### New Capabilities
- `settings-drawer`: Slide-in drawer from the ⚙️ button with a searchable section list, role-filtered items, and navigation to the full settings page or directly to a section route.
- `settings-page`: Full-screen settings page at `/settings` with a left nav sidebar and routed section panels (`/settings/appearance`, `/settings/account`, `/settings/platform`, `/settings/accessibility`, `/settings/security`).
- `settings-store`: New `settingsStore.ts` Zustand store centralizing all user preferences (theme, CRM skin, density, accessibility prefs) and platform config, replacing the scattered preference state in `authStore`.
- `settings-appearance`: Section A — theme toggle (light/dark, all roles), CRM skin picker (admin + mentor only), sidebar default collapse toggle, density switcher. Fully localStorage-persisted.
- `settings-account`: Section B — read-only display of name, email/phone, role badge, User ID, Org ID. All roles.
- `settings-platform`: Section C — admin-only form for org name, accepted payment methods (checkboxes), student type labels, slot time presets, enrollment statuses, referral sources. Syncs to backend via `GET`/`PUT /api/admin/settings`.
- `settings-accessibility`: Section E — reduce motion toggle, font size selector (small/medium/large), high contrast toggle. All roles. localStorage-persisted.
- `settings-security`: Section F — read-only display: session start info ("Signed in X days ago"), role, last active. Admin + mentor only.
- `settings-search`: Client-side filter in the drawer and settings page left nav, filtering section items by label match.

### Modified Capabilities
- `auth-store`: Remove `theme`, `activeCrmTheme`, `toggleTheme()`, and `setCrmTheme()` from `authStore`. Migrate all consumers to use `settingsStore` instead.

## Impact

- **Frontend files changed**: `authStore.ts` (remove prefs), `DashboardContainer.tsx` (wire drawer, update theme/CRM skin imports), `App.tsx` (add `/settings/*` routes, update theme class application).
- **Frontend files added**: `settingsStore.ts`, `SettingsDrawer.tsx`, `SettingsPage.tsx`, `SettingsNav.tsx`, section components (`AppearanceSettings.tsx`, `AccountSettings.tsx`, `PlatformSettings.tsx`, `AccessibilitySettings.tsx`, `SecuritySettings.tsx`), API layer `settingsApi.ts`.
- **Backend files changed**: `AdminSettingsController.java` (add GET endpoint), `SettingsServicePort.java` (add `getSettings()` method), `SettingsService.java` (implement `getSettings()`).
- **No database schema changes**: `system_settings_t` table and `SystemSetting` entity remain as-is.
- **No new dependencies**: Uses existing Hero UI, Zustand, Axios, React Router, and Lucide icons.
