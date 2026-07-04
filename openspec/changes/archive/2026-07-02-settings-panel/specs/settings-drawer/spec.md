## ADDED Requirements

### Requirement: Settings sections registry is the single source of truth
A `SETTINGS_SECTIONS` constant (in `settings.config.ts`) defines all sections as `{ id, label, icon, route, roles[] }`. Both the drawer and the settings page left nav import from this single file. No section definitions are duplicated.

#### Scenario: Section list stays consistent between drawer and page
- **WHEN** a new settings section is added to `SETTINGS_SECTIONS`
- **THEN** it appears in both the Settings Drawer and the Settings Page left nav automatically, without modifying either component

---

### Requirement: Settings Drawer opens from the ⚙️ button in the top bar
Clicking the ⚙️ Avatar button in `DashboardContainer`'s top header bar opens a right-side `Drawer` (Hero UI). The drawer matches the Zoho Invoice reference: title "Settings", search bar, scrollable list of sections with icons, grouped by category.

#### Scenario: Drawer opens
- **WHEN** the user clicks the ⚙️ button in the top bar
- **THEN** the Settings Drawer slides in from the right, showing role-filtered section items

#### Scenario: Drawer search filters sections
- **WHEN** the user types in the "Search Settings" input inside the drawer
- **THEN** only section items whose labels match the search string (case-insensitive) are shown

#### Scenario: Clicking a drawer section navigates and closes
- **WHEN** the user clicks any section item in the drawer (e.g., "Appearance")
- **THEN** the drawer closes and the browser navigates to the corresponding route (e.g., `/settings/appearance`)

#### Scenario: "All Settings" link navigates to settings root
- **WHEN** the user clicks "All Settings" at the top of the drawer
- **THEN** the drawer closes and the browser navigates to `/settings`

---

### Requirement: Settings Page is a full-screen takeover
The `/settings` route renders `SettingsLayout.tsx` — a full-screen component that hides the GenLab sidebar and top bar. It consists of a left nav sidebar (using `ListBox`) and a main content panel (`<Outlet />`).

#### Scenario: Settings page hides dashboard chrome
- **WHEN** the user navigates to any `/settings/*` route
- **THEN** the GenLab sidebar nav and top header bar are NOT visible

#### Scenario: Left nav highlights active section
- **WHEN** the current route is `/settings/appearance`
- **THEN** the "Appearance" item in the settings left nav is highlighted as active

#### Scenario: Default route redirects to first available section
- **WHEN** the user navigates to `/settings` with no sub-path
- **THEN** they are redirected to `/settings/appearance` (or the first section available for their role)

#### Scenario: "Close Settings" exits the settings page
- **WHEN** the user clicks "Close Settings" (top-right of settings page)
- **THEN** they navigate back to `/admin/dashboard` (or role-appropriate dashboard route)

---

### Requirement: Settings sections are role-filtered
The `filterSectionsByRole(sections, role)` pure utility function filters `SETTINGS_SECTIONS` by checking each section's `roles[]` array against the current user's role.

#### Scenario: Admin sees all sections
- **WHEN** the logged-in user has role `admin`
- **THEN** the drawer and left nav show sections: Appearance, Account, Platform, Accessibility, Security

#### Scenario: Mentor sees limited sections
- **WHEN** the logged-in user has role `mentor`
- **THEN** the drawer and left nav show sections: Appearance, Account, Accessibility, Security (Platform is hidden)

#### Scenario: Student sees minimal sections
- **WHEN** the logged-in user has role `student`
- **THEN** the drawer and left nav show sections: Appearance (theme only, CRM skin hidden), Account (read-only)
