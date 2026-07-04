## ADDED Requirements

### Requirement: Appearance section controls theme (all roles)
`AppearanceSettings.tsx` renders a theme toggle (light/dark) accessible to all roles. It reads `theme` from `settingsStore` and calls `settingsStore.setTheme()` on change. Uses Hero UI `Switch` component.

#### Scenario: Theme toggle changes theme
- **WHEN** the user clicks the theme toggle in Appearance settings
- **THEN** `settingsStore.setTheme()` is called, the theme updates immediately, and the new value is persisted to `localStorage`

---

### Requirement: Appearance section controls CRM skin (admin + mentor only)
The CRM skin picker (showing genlab / zoho-crm / odoo-crm / sap-crm options) is only rendered when `userRole` is `admin` or `mentor`. Uses Hero UI `RadioGroup` with skin preview cards.

#### Scenario: CRM skin picker is hidden for students
- **WHEN** the logged-in user has role `student` and opens `/settings/appearance`
- **THEN** the CRM skin picker section is NOT rendered

#### Scenario: CRM skin change is applied immediately
- **WHEN** an admin or mentor selects a CRM skin option
- **THEN** `settingsStore.setCrmTheme()` is called and the active theme class is updated on `<html>`

---

### Requirement: Appearance section controls sidebar default and density (all roles)
A toggle for "Sidebar collapsed by default" (bool) and a density switcher ("Comfortable" / "Compact") are shown to all roles. Both are persisted to `localStorage` via `settingsStore`.

#### Scenario: Density switch changes layout density token
- **WHEN** the user switches density from "Comfortable" to "Compact"
- **THEN** `settingsStore.setDensity('compact')` is called and the CSS density token is updated on `<html>`

---

### Requirement: Account section is read-only (all roles)
`AccountSettings.tsx` displays the user's name (derived from email), email, phone, role badge, User ID, and Org ID. All values come from `useAuthStore()`. No form fields are editable. Inputs render as `disabled` Hero UI `Input` components.

#### Scenario: Account section shows correct user data
- **WHEN** any logged-in user navigates to `/settings/account`
- **THEN** they see their email, role, User ID, and Org ID — all non-editable

---

### Requirement: Platform section is admin-only with save/cancel (admin only)
`PlatformSettings.tsx` shows an editable form for: Org Name (text input), Accepted Payment Methods (checkboxes: cash, card, bank transfer, UPI, other), Student Types (text tags), Slot Time Presets (text tags), Enrollment Statuses (text tags), Referral Sources (text tags). Has "Save" and "Cancel" buttons. Data loads from `settingsStore.platformConfig` (fetched from backend on mount). Save calls `settingsStore.savePlatformConfig()`.

#### Scenario: Non-admin cannot access Platform section route
- **WHEN** a mentor or student navigates to `/settings/platform`
- **THEN** they are redirected to `/settings/appearance`

#### Scenario: Platform form shows backend-persisted values
- **WHEN** an admin opens the Platform section
- **THEN** the form fields are pre-populated with values from `GET /api/admin/settings`

#### Scenario: Save persists to backend
- **WHEN** the admin edits the Org Name and clicks Save
- **THEN** `PUT /api/admin/settings` is called with `{ 'org.name': '<new value>' }` and a success toast is shown

---

### Requirement: Accessibility section (all roles, localStorage only)
`AccessibilitySettings.tsx` shows three controls: Reduce Motion toggle (`Hero UI Switch`), Font Size selector (small/medium/large — `Hero UI RadioGroup`), High Contrast toggle (`Hero UI Switch`). All stored in `settingsStore.accessibility` and persisted to localStorage. CSS custom properties on `<html>` reflect the font size selection.

#### Scenario: Reduce motion disables CSS transitions
- **WHEN** the user enables "Reduce Motion"
- **THEN** `settingsStore.setAccessibility({ reduceMotion: true })` is called and a CSS class `reduce-motion` is applied to `<html>`

#### Scenario: Font size changes body font scale
- **WHEN** the user selects "Large" font size
- **THEN** `settingsStore.setAccessibility({ fontSize: 'large' })` is called and the CSS `--font-scale` token is updated

---

### Requirement: Security section is read-only (admin + mentor only)
`SecuritySettings.tsx` displays session information: "Signed in X days ago" (calculated from a `loginAt` timestamp stored in localStorage at login), the user's role, and last active time. No editable fields. "Change Password" and "Sign out all devices" are visible but marked as "Coming Soon" with disabled styling.

#### Scenario: Session age is calculated from login timestamp
- **WHEN** a user opens the Security section
- **THEN** the displayed session age is calculated as `now - loginAt` in days

#### Scenario: Student cannot access Security section
- **WHEN** a student navigates to `/settings/security`
- **THEN** they are redirected to `/settings/appearance`
