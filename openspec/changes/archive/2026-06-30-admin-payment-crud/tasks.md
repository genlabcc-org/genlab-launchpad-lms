## 1. Backend Service Layer

- [ ] 1.1 Add `getPayment(UUID id)` and `deletePayment(UUID id)` to `AdminService.java`.
- [ ] 1.2 Implement validation and fetch methods `getEnrollmentPayments(...)` and `getEnrollmentPaymentDetails(...)` in `PaymentService.java` with role-based checks.

## 2. Backend Controller Layer

- [ ] 2.1 Create `AdminPaymentController.java` under `cc.genlab.genlablaunchpadlmsapi.controller.admin` with `@RequestMapping("/api/admin/payments")` for admin CRUD.
- [ ] 2.2 Create `SharedPaymentController.java` under `cc.genlab.genlablaunchpadlmsapi.controller.shared` with `@RequestMapping("/api/enrollments")` for shared routes.
- [ ] 2.3 Remove deprecated payment mappings from `AdminController.java`.

## 3. Backend Verification & Testing

- [ ] 3.1 Update `AdminControllerTest.java` (if existing) or write a new `AdminPaymentControllerTest.java` and `SharedPaymentControllerTest.java` to verify routing, authorization, and ownership checks.
- [ ] 3.2 Run the test suite and verify build/test status.
