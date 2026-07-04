## 1. Backend — Service & Repository Layer

- [x] 1.1 Add `getSettings(): Map<String, String>` method signature to `SettingsServicePort` interface
- [x] 1.2 Implement `getSettings()` in `SettingsService`: call `systemSettingRepository.findAll()` and collect into `Map<String, String>` using `Collectors.toMap(SystemSetting::getKey, SystemSetting::getValue)`
- [x] 1.3 Add `@GetMapping` to `AdminSettingsController` that calls `settingsService.getSettings()` and returns the map directly (no DTO needed — key-value is the contract)
- [x] 1.4 Write unit test `SettingsServiceTest`: verify `getSettings()` returns correct map from mocked repository response
- [x] 1.5 Write controller slice test `AdminSettingsControllerTest`: verify `GET /api/admin/settings` returns 200 with correct JSON and `PUT /api/admin/settings` returns 200 with success message

## 2. Frontend — API Layer

- [x] 2.1 Create `app/frontend/src/api/settingsApi.ts` with two exported functions:
  - `getSettings(): Promise<Record<string, string>>` — calls `GET /api/admin/settings`
  - `updateSettings(payload: Record<string, string>): Promise<void>` — calls `PUT /api/admin/settings`
- [x] 2.2 Write Vitest unit test for `settingsApi.ts` — mock `apiClient` and verify correct endpoint + payload for both functions

## 3. Frontend — Data Layer (settingsStore)

- [x] 3.1 Create `app/frontend/src/store/settingsStore.ts` with the following state:
  - `theme: 'light' | 'dark'`
  - `activeCrmTheme: CrmTheme` (import type from `authStore.ts`)
  - `density: 'comfortable' | 'compact'`
  - `accessibility: { reduceMotion: boolean; fontSize: 'small' | 'medium' | 'large'; highContrast: boolean }`
  - `platformConfig: { orgName: string; acceptedPaymentMethods: string[]; studentTypes: string[]; slotTimePresets: string[]; enrollmentStatuses: string[]; referralSources: string[] }`
  - `platformConfigLoading: boolean`
  - `platformConfigError: string | null`
- [x] 3.2 Add actions to `settingsStore`:
  - `setTheme(theme)` — updates state + `localStorage`
  - `setCrmTheme(skin)` — updates state + `localStorage`
  - `setDensity(density)` — updates state + `localStorage`
  - `setAccessibility(partial)` — merges partial + `localStorage`
  - `fetchPlatformConfig()` — calls `settingsApi.getSettings()`, maps keys to `platformConfig` fields
  - `savePlatformConfig(draft)` — calls `settingsApi.updateSettings()` with key-value payload
  - `initialize()` — reads all personal prefs from `localStorage` and hydrates state
- [x] 3.3 Remove `theme`, `activeCrmTheme`, `toggleTheme()`, `setCrmTheme()` from `authStore.ts`. Keep all auth-only state and actions.
- [x] 3.4 Update `App.tsx` to call `settingsStore.initialize()` alongside `authStore.initialize()` on mount
- [x] 3.5 Update `App.tsx` theme class application: replace `useAuthStore().theme` with `useSettingsStore().theme`
- [x] 3.6 Update `DashboardContainer.tsx`: replace `theme`/`toggleTheme` from `useAuthStore()` with `useSettingsStore()` equivalents
- [x] 3.7 Write Vitest unit tests for `settingsStore`: test `setTheme`, `setDensity`, `setAccessibility`, `initialize` (with mocked localStorage), `fetchPlatformConfig` and `savePlatformConfig` (with mocked `settingsApi`)

## 4. Frontend — Settings Configuration (Single Source of Truth)

- [x] 4.1 Create `app/frontend/src/components/settings/settings.config.ts` defining:
  - `SettingsSection` interface: `{ id: string; label: string; icon: LucideIcon; route: string; roles: UserRole[] }`
  - `SETTINGS_SECTIONS: SettingsSection[]` array with entries for: Appearance, Account, Platform, Accessibility, Security
  - `filterSectionsByRole(sections, role)` pure utility function
- [x] 4.2 Write Vitest unit tests for `filterSectionsByRole`: verify correct sections returned for admin, mentor, and student roles

## 5. Frontend — View Layer: Settings Drawer

- [x] 5.1 Create `app/frontend/src/components/settings/SettingsDrawer.tsx`:
  - Props: `isOpen: boolean`, `onClose: () => void`
  - Uses Hero UI `Drawer`, `Drawer.Backdrop`, `Drawer.Content`, `Drawer.Dialog`, `Drawer.Body`
  - Placement: `right`, max-width `sm`
  - Header: title "Settings" + close button (X icon)
  - Search: Hero UI `Input` with Search icon, local state `searchQuery`
  - Section list: `filterSectionsByRole(SETTINGS_SECTIONS, userRole)` filtered by `searchQuery`, rendered as clickable list items with icon + label (matching Zoho Invoice screenshot style)
  - "All Settings" link at top of list navigates to `/settings`
  - Clicking any section item navigates to its `route` and calls `onClose()`
  - Zero business logic — pure navigation component
- [x] 5.2 Wire `SettingsDrawer` into `DashboardContainer.tsx`:
  - Add `isSettingsDrawerOpen` state + `setIsSettingsDrawerOpen`
  - ⚙️ Avatar button `onClick` sets `isSettingsDrawerOpen(true)`
  - Render `<SettingsDrawer isOpen={isSettingsDrawerOpen} onClose={() => setIsSettingsDrawerOpen(false)} />`
- [x] 5.3 Write Vitest unit test for `SettingsDrawer`: verify role-filtered sections render, search filters work, navigation is triggered on item click

## 6. Frontend — View Layer: Settings Page Layout

- [x] 6.1 Create `app/frontend/src/components/settings/SettingsLayout.tsx`:
  - Full-screen layout (100vw × 100vh, no sidebar/topbar)
  - Top bar: "All Settings" breadcrumb (with GenLab logo), center search input (`/` shortcut), "Close Settings ×" button (navigates to role dashboard)
  - Left sidebar: `ListBox` with `SETTINGS_SECTIONS` filtered by role, active route highlighted
  - Main panel: `<Outlet />` renders the active section
  - Uses Hero UI `Surface`, `ListBox`, `Input` components
- [x] 6.2 Create `app/frontend/src/components/settings/SettingsNav.tsx`:
  - Extracted left nav list as its own component (SRP)
  - Props: `sections: SettingsSection[]`, `activeRoute: string`
  - Uses Hero UI `ListBox` + `ListBox.Item`
  - Each item shows icon + label, active item highlighted with primary color
- [x] 6.3 Add settings routes to `App.tsx`:
  - `/settings` → `<SettingsLayout>` with default redirect to `/settings/appearance`
  - `/settings/appearance` → `<AppearanceSettings />`
  - `/settings/account` → `<AccountSettings />`
  - `/settings/platform` → `<PlatformSettings />` (admin only, redirect others to `/settings/appearance`)
  - `/settings/accessibility` → `<AccessibilitySettings />`
  - `/settings/security` → `<SecuritySettings />` (admin + mentor only, redirect students to `/settings/appearance`)
- [x] 6.4 Write Vitest test for `SettingsNav`: verify active item highlighting, role-filtered items

## 7. Frontend — View Layer: Section Components

- [x] 7.1 Create `app/frontend/src/components/settings/sections/AppearanceSettings.tsx`:
  - Theme toggle: Hero UI `Switch`, reads/writes `settingsStore.theme`
  - CRM skin picker: Hero UI `RadioGroup` with 4 options (genlab, zoho-crm, odoo-crm, sap-crm) — rendered only if `userRole !== 'student'`
  - Sidebar default collapse: Hero UI `Switch`, reads/writes `settingsStore.sidebarCollapsedByDefault`
  - Density: Hero UI `RadioGroup` with "Comfortable" / "Compact" options
- [x] 7.2 Create `app/frontend/src/components/settings/sections/AccountSettings.tsx`:
  - Display: Avatar (Person icon), name (derived from email), email, phone, role badge, User ID, Org ID
  - All fields: disabled Hero UI `Input` components (read-only)
  - Data sourced from `useAuthStore()`
- [x] 7.3 Create `app/frontend/src/components/settings/sections/PlatformSettings.tsx` (admin only):
  - On mount: calls `settingsStore.fetchPlatformConfig()`
  - Local draft state for form edits
  - Fields: Org Name (Hero UI `Input`), Accepted Payment Methods (Hero UI `Checkbox` group), Student Types / Slot Time Presets / Enrollment Statuses / Referral Sources (Hero UI tag-input pattern or comma-separated `Input`)
  - Save button: calls `settingsStore.savePlatformConfig(draft)` — shows success/error toast
  - Cancel button: resets draft to last fetched values
- [x] 7.4 Create `app/frontend/src/components/settings/sections/AccessibilitySettings.tsx`:
  - Reduce Motion: Hero UI `Switch`, reads/writes `settingsStore.accessibility.reduceMotion`
  - Font Size: Hero UI `RadioGroup` with small/medium/large, reads/writes `settingsStore.accessibility.fontSize`
  - High Contrast: Hero UI `Switch`, reads/writes `settingsStore.accessibility.highContrast`
  - On each change: updates CSS custom properties on `<html>` element
- [x] 7.5 Create `app/frontend/src/components/settings/sections/SecuritySettings.tsx` (admin + mentor only):
  - Session info: "Signed in X days ago" — calculated from `loginAt` in localStorage
  - Role badge display
  - "Change Password" and "Sign out all devices" buttons — visible but `disabled` with "Coming Soon" tooltip
- [x] 7.6 Write Vitest tests for each section component: verify rendering with correct props, role-conditional elements, store interactions

## 8. Frontend — CSS / Theme Integration

- [x] 8.1 Add `reduce-motion` CSS class to `index.css` that sets `* { transition: none !important; animation: none !important; }` when applied to `<html>`
- [x] 8.2 Add `--font-scale` CSS custom property tokens to `index.css` for small (0.875), medium (1), large (1.125) — applied to `<html>` based on `settingsStore.accessibility.fontSize`
- [x] 8.3 Add `density-compact` CSS class to `index.css` reducing spacing tokens when applied to `<html>`
- [x] 8.4 Update `App.tsx` to reactively apply `reduce-motion`, `density-*`, and font-scale classes to `<html>` based on `settingsStore` state

## 9. Verification

- [x] 9.1 Run `npm run build` — confirm zero TypeScript errors
- [x] 9.2 Run `npm run test:run` — confirm all existing + new Vitest tests pass (target: 150+ passing)
- [x] 9.3 Run `mvn test` in `app/backend` — confirm all existing + new JUnit tests pass
- [x] 9.4 Manual smoke test: open drawer from ⚙️ button, navigate to each section for each role (admin/mentor/student), verify role-gating works, verify appearance changes apply live, verify platform config round-trip (save + reload)
- [x] 9.5 Run `graphify update .` to update the knowledge graph
