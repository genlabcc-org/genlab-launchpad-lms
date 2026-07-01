## Context

Currently, admin payment endpoints (record, list, update, get enrollment payments) are embedded in `AdminController.java`. There is no endpoint allowing students to fetch their own payments for a specific enrollment, nor is there a route for retrieving specific payment details with role-based checks.

## Goals / Non-Goals

**Goals:**
- Separate all admin payment CRUD APIs into a dedicated `AdminPaymentController` to follow repository structure conventions.
- Provide new admin APIs to read a single payment (`GET /api/admin/payments/{id}`) and delete a payment (`DELETE /api/admin/payments/{id}`).
- Create shared routes at `/api/enrollments/{enrollmentId}/payments` and `/api/enrollments/{enrollmentId}/payments/{paymentId}` to allow both admin and student users to retrieve enrollment payments under proper visibility constraints.
- Implement ownership and role-based validation in the service layer (`PaymentService.java`).

**Non-Goals:**
- Modifying the underlying database schema or `Payment` entity definition.
- Allowing self-registration or changes to role assignments.

## Decisions

1. **Admin CRUD Isolation**:
   - Create `AdminPaymentController.java` mapped to `/api/admin/payments` annotated with `@RequiresRole("admin")`.
   - Remove payment-related mappings from `AdminController.java`.
   - Add `getPayment(UUID id)` and `deletePayment(UUID id)` to `AdminService.java`.

2. **Shared Routes**:
   - Create `SharedPaymentController.java` mapped to `/api/enrollments` annotated with `@RequiresRole({"admin", "student"})`.
   - Add endpoints:
     - `GET /{enrollmentId}/payments`
     - `GET /{enrollmentId}/payments/{paymentId}`
   - Inject `RoleService` and `PaymentService` to resolve authentication details from request attributes.

3. **Service Layer Validation**:
   - In `PaymentService.java`, add methods:
     - `getEnrollmentPayments(UUID enrollmentId, String userId, String userRole)`
     - `getEnrollmentPaymentDetails(UUID enrollmentId, UUID paymentId, String userId, String userRole)`
   - Implement authorization verification in these methods: if the role is `student`, verify that the enrollment's student ID matches the authenticated `userId`.

## Risks / Trade-offs

- Removing the endpoints from `AdminController` cleans up routing but might require updating existing tests that mock or call `AdminController`. We will update the test suite to reflect this controller split.
