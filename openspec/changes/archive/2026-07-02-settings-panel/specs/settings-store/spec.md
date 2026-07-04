## ADDED Requirements

### Requirement: settingsStore is the single source of truth for all user preferences
`settingsStore.ts` (Zustand) owns: `theme`, `activeCrmTheme`, `density`, `accessibility` (reduceMotion, fontSize, highContrast), and `platformConfig`. It persists personal prefs to `localStorage` and syncs platform config to the backend. `authStore` no longer contains `theme`, `activeCrmTheme`, `toggleTheme()`, or `setCrmTheme()`.

#### Scenario: Theme is read from settingsStore
- **WHEN** any component needs the current theme
- **THEN** it reads from `useSettingsStore()`, not `useAuthStore()`

#### Scenario: authStore contains no preference state
- **WHEN** `authStore.ts` is inspected
- **THEN** it contains only: `isAuthenticated`, `userRole`, `userId`, `email`, `phone`, `currentPath`, `setSession()`, `clearSession()`, `navigate()`, `initialize()`

#### Scenario: settingsStore hydrates from localStorage on startup
- **WHEN** the app initializes (`settingsStore.initialize()` is called in `App.tsx`)
- **THEN** `theme`, `activeCrmTheme`, `density`, and `accessibility` prefs are restored from `localStorage`

---

### Requirement: settingsStore exposes a platformConfig slice (admin only)
`settingsStore.platformConfig` holds: `orgName`, `acceptedPaymentMethods`, `studentTypes`, `slotTimePresets`, `enrollmentStatuses`, `referralSources`. These are fetched from `GET /api/admin/settings` on settings page mount and saved via `PUT /api/admin/settings`.

#### Scenario: Platform config loads from backend
- **WHEN** an admin opens the Platform section
- **THEN** `settingsStore.fetchPlatformConfig()` is called, which calls `settingsApi.getSettings()`, and the response hydrates `platformConfig` in the store

#### Scenario: Platform config saves to backend
- **WHEN** an admin clicks "Save" in the Platform section
- **THEN** `settingsStore.savePlatformConfig(draft)` is called, which calls `settingsApi.updateSettings(payload)`, and success shows a toast confirmation

#### Scenario: Non-admin cannot access platformConfig actions
- **WHEN** a mentor or student calls `settingsStore.savePlatformConfig()`
- **THEN** the action is a no-op (the Platform section route is not accessible for those roles)

---

### Requirement: API Layer (settingsApi.ts) handles all backend communication
`settingsApi.ts` in the API layer exports two functions: `getSettings(): Promise<Record<string, string>>` and `updateSettings(payload: Record<string, string>): Promise<void>`. No component or store imports `apiClient` directly for settings.

#### Scenario: GET settings returns key-value map
- **WHEN** `settingsApi.getSettings()` is called
- **THEN** it sends `GET /api/admin/settings` via `apiClient` and returns the response body as `Record<string, string>`

#### Scenario: PUT settings sends key-value map
- **WHEN** `settingsApi.updateSettings({ 'org.name': 'PEC Developers Initiative' })` is called
- **THEN** it sends `PUT /api/admin/settings` with the map as the request body
