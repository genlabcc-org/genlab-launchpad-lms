## ADDED Requirements

### Requirement: Admin CRUD operations on payments
Administrators must be able to perform standard Create, Read, Update, and Delete operations on all student payments in the system.

#### Scenario: Record payment
- **WHEN** Admin submits a valid `RecordPaymentRequest` to `POST /api/admin/payments`
- **THEN** The payment is recorded under the specified enrollment, and the returned PaymentDto is populated.

#### Scenario: List all payments
- **WHEN** Admin calls `GET /api/admin/payments`
- **THEN** A list of all payments in the system is returned.

#### Scenario: Read specific payment
- **WHEN** Admin calls `GET /api/admin/payments/{id}`
- **THEN** The details of that specific payment are returned.

#### Scenario: Update payment
- **WHEN** Admin submits a valid `UpdatePaymentRequest` to `PUT /api/admin/payments/{id}`
- **THEN** The payment details are updated, and the updated PaymentDto is returned.

#### Scenario: Delete payment
- **WHEN** Admin calls `DELETE /api/admin/payments/{id}`
- **THEN** The payment is deleted, and a 204 No Content response is returned.

### Requirement: Shared route for enrollment payments
A shared route must be available for both student and admin users to view payments of a specific enrollment. Students can only access their own enrollment payments, while admins can access any enrollment's payments.

#### Scenario: Student views own enrollment payments
- **WHEN** Authenticated user with role `student` calls `GET /api/enrollments/{enrollmentId}/payments`
- **THEN** If the enrollment belongs to the student, the list of payments for that enrollment is returned. Otherwise, 403 Forbidden is returned.

#### Scenario: Student views own specific payment details
- **WHEN** Authenticated user with role `student` calls `GET /api/enrollments/{enrollmentId}/payments/{paymentId}`
- **THEN** If the enrollment and payment belong to the student, the specific payment details are returned. Otherwise, 403 Forbidden is returned.

#### Scenario: Admin views any enrollment payments
- **WHEN** Authenticated user with role `admin` calls `GET /api/enrollments/{enrollmentId}/payments`
- **THEN** The list of payments for that enrollment is returned regardless of owner.

#### Scenario: Admin views any specific payment details
- **WHEN** Authenticated user with role `admin` calls `GET /api/enrollments/{enrollmentId}/payments/{paymentId}`
- **THEN** The specific payment details are returned.
