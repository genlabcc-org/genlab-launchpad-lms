## Why

The current user interface exposes a separate "User Profile" drawer and a "Settings" drawer. To simplify the application's user experience and layout, we are combining these two drawers into a single combined drawer. We will remove the redundant quick actions grid, accessibility preferences, and help links (FAQs, Forum, Video Tutorials, Migration Guide, Help Documents) from the profile section and integrate the profile information block (avatar, username, email, user ID, organization ID, and Sign Out action) directly into the Settings drawer.

## What Changes

- We will modify `DashboardContainer.tsx` to:
  - Eliminate the separate profile details drawer.
  - Combine the profile trigger button and the settings trigger button in the top bar into a single profile/settings avatar trigger button.
  - Pass user identity details (username, email, etc.) and the logout handler to a unified `SettingsDrawer` component.
- We will modify `SettingsDrawer.tsx` to:
  - Render the user profile header block at the top of the settings list (avatar, username, email, user ID, organization ID, and the "Sign Out" action button).
  - Remove all other former profile drawer links/buttons (e.g., the 6 quick action grid buttons, the extra accessibility preference link, and the help links) to keep the layout simple and streamlined.
- We will update the specifications for settings drawers and profile drawers.

## Capabilities

### Modified Capabilities

- `settings-drawer`: Combine the profile details and the settings navigation list into a single drawer, removing quick actions and help grid elements.
