## ADDED Requirements

### Requirement: Unified settings and profile drawer
The settings drawer is modified to show user profile details (avatar, username, email, user ID, organization ID, and a "Sign Out" action button) directly inside the drawer overlay. The separate profile details drawer is completely removed from the dashboard layout.

#### Scenario: Settings Drawer displays user profile info
- **WHEN** the Settings Drawer is opened
- **THEN** it displays the logged-in user's details (username, email, ID, organization ID) at the top of the drawer layout

#### Scenario: Consolidating trigger buttons
- **WHEN** rendering the dashboard top bar
- **THEN** only a single profile avatar button is rendered which opens the combined Settings Drawer

#### Scenario: Sign Out action is available in Settings Drawer
- **WHEN** clicking the "Sign Out" button inside the Settings Drawer
- **THEN** the drawer is closed, and the logout action is executed
