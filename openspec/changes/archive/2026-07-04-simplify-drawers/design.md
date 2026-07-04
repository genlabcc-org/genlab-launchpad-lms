## Context

Currently, the layout features two distinct right-hand drawer overlays: one for a User Profile (`isProfileDrawerOpen`), and one for Settings (`isSettingsDrawerOpen`). The User Profile drawer contains administrative/session details (avatar, username, email, ID, organization ID, and "Sign Out" button) along with quick action items, assistance preferences, and email help links. 
As part of our efforts to simplify the UI/UX, we want to combine both into a single `SettingsDrawer` and completely eliminate the separate profile drawer and its associated quick action links/assistance components.

## Goals / Non-Goals

**Goals:**
- Eliminate the separate profile drawer (`isProfileDrawerOpen` and its layout markup) from `DashboardContainer.tsx`.
- Combine the top header bar triggers: replace the separate ⚙️ (Settings) and user profile buttons with a single settings/profile trigger button. We will use the user's avatar/profile icon or a settings icon representing settings and account control.
- Modify the `SettingsDrawer` to incorporate the profile information block: avatar, username, email, user ID, organization ID, and the "Sign Out" action button.
- Remove the grid of 6 quick action links, accessibility preferences (the redundant bottom link, keeping settings-based accessibility sections untouched), and assistance links from the UI to streamline the layout.

**Non-Goals:**
- Modifying the actual settings pages or backend authentication/session storage endpoints beyond the drawer layout.
- Changing the standard settings navigation sections logic in `settings.config.ts`.

## Decisions

- **Single Trigger Button**: We will consolidate the top header action buttons. We will render a single action button (configured to look like the User profile avatar button, or showing the user avatar, but opening the consolidated `SettingsDrawer`).
- **Profile Block Placement**: The profile information block (user details, email, and the Sign Out button) will be placed at the very top of the `SettingsDrawer` before the search bar and setting navigation options. This groups identity management and settings together naturally.
- **Removing Redundant Items**: The quick action links and "Need Assistance?" sections will be removed entirely, as instructed.

## Risks / Trade-offs

- Consolidating the drawers reduces layout complexity but removes quick access shortcuts to FAQs, Forum, and Migration Guide. However, since the user explicitly requested this simplification, this is the desired path.
