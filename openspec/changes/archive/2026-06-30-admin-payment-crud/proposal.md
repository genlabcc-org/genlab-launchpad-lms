## Why

Currently, there is no separate route for administrators to perform CRUD operations on payments, and no shared route for students to view their payment history for a specific enrollment while still allowing admins to see all details. We need to modularize the controller layer, separating the core payment operations for admins and exposing a secure shared endpoint that enforces proper role-based visibility.

## What Changes

- Create `AdminPaymentController.java` mapped to `/api/admin/payments` for full admin CRUD on payments.
- Remove payment-related endpoints from `AdminController.java`.
- Create a shared `SharedPaymentController.java` (or add to a shared controller) supporting a shared route `/api/enrollments/{enrollmentId}/payments` and `/api/enrollments/{enrollmentId}/payments/{paymentId}` to allow students to retrieve only their own payments and admins to retrieve any payments.
- Add necessary service methods in `AdminService.java` for reading single payments and deleting payments.
- Add backend unit and integration tests.

## Capabilities

### New Capabilities
- `admin-payment-crud`: Exposes full CRUD REST APIs for administrators to manage student payments and provides shared REST APIs for students to retrieve their own payment history while allowing administrators full visibility.

### Modified Capabilities

## Impact

- **Affected Code**: `AdminController.java`, `AdminService.java`, a new `AdminPaymentController.java`, and a new `SharedPaymentController.java` (or shared routing configuration).
- **APIs**: Restructures `/api/admin/payments` and adds shared routes under `/api/enrollments/{enrollmentId}/payments`.
- **Frontend Impact**: The frontend communicates with the database/Supabase exclusively through backend API proxy endpoints, conforming to role accessibility. Component styling uses Hero UI matching docs/genlab-design.json, parameterized and disabled until explicit design approval is received.
- **Design Principles**: Adheres strictly to SOLID, DRY, and KISS design principles.
