## ADDED Requirements

### Requirement: GET /api/admin/settings returns all system settings as key-value map
A new `@GetMapping` is added to `AdminSettingsController` that returns all entries from `system_settings_t` as `Map<String, String>`. The `SettingsServicePort` interface gains a `getSettings()` method. `SettingsService` implements it by calling `systemSettingRepository.findAll()` and mapping to a `Map<String, String>`.

#### Scenario: Admin fetches settings
- **WHEN** `GET /api/admin/settings` is called with a valid admin session
- **THEN** the response is HTTP 200 with a JSON object of all key-value pairs in `system_settings_t`

#### Scenario: Non-admin is rejected
- **WHEN** `GET /api/admin/settings` is called with a mentor or student session
- **THEN** the `@RequiresRole("admin")` aspect rejects the request with HTTP 403

---

### Requirement: PUT /api/admin/settings persists platform config keys
The existing `PUT /api/admin/settings` endpoint accepts a `Map<String, String>` and upserts each key into `system_settings_t`. Platform config keys follow the dot-notation convention: `org.name`, `payment.accepted_methods`, `slot.time_presets`, `student.types`, `enrollment.statuses`, `referral.sources`.

#### Scenario: Platform config is upserted
- **WHEN** `PUT /api/admin/settings` is called with `{ "org.name": "PEC Developers Initiative" }`
- **THEN** the `system_settings_t` row with key `org.name` is created or updated, and HTTP 200 with a success message is returned

---

### Requirement: SettingsServicePort interface follows ISP
`SettingsServicePort` defines exactly two methods: `getSettings(): Map<String, String>` and `updateSettings(Map<String, String>): void`. No additional methods are added to this interface. This satisfies ISP — consumers depend only on what they need.

#### Scenario: SettingsService implements both methods
- **WHEN** `SettingsService` is inspected
- **THEN** it implements both `getSettings()` and `updateSettings()` from `SettingsServicePort`
