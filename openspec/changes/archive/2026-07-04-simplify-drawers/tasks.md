## 1. Unified Settings Drawer UI

- [x] 1.1 Update `SettingsDrawer.tsx` component properties and imports (add username, email, and handleLogout prop parameters).
- [x] 1.2 Implement the user profile details block (Avatar, Username, Email, User ID, Organization ID, and "Sign Out" button) at the top of the `SettingsDrawer` layout.
- [x] 1.3 Ensure the layout looks clean, using Tailwind classes and standard Hero UI components matching styling guides.

## 2. Refactor Dashboard Container

- [x] 2.1 Remove `isProfileDrawerOpen` state from `DashboardContainer.tsx` and all profile drawer rendering markup block (lines 128 to 259).
- [x] 2.2 Consolidate the header actions: replace the settings avatar button and user profile avatar button with a single profile avatar button that sets `isSettingsDrawerOpen(true)`.
- [x] 2.3 Pass user profile information (email, username) and `handleLogout` function into `<SettingsDrawer>` in `DashboardContainer.tsx`.

## 3. Verify Integration

- [x] 3.1 Update and run unit test `SettingsDrawer.test.tsx` to ensure `SettingsDrawer` remains test-compliant and correct.
