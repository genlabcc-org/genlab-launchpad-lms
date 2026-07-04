# Spec: Directory Management

## Purpose
Provide administrative interfaces and directories for students, mentors, and courses with consistent UI visual primitives and seamless CRUD/onboarding pipelines.

## Requirements

### Requirement: Unified UI Visual Primitives
The frontend application must provide standard, reusable components to display list directories for administrative entities (courses, students, mentors).

#### Scenario: Render Directory Layouts
- **WHEN** the user visits the Courses, Students, or Mentors directory view
- **THEN** they see an Odoo-style header with record counts, inline search, filters dropdown, standard actions, and a table with pagination.

#### Scenario: Row Selection & Bulk Actions
- **WHEN** the user selects rows in the list table
- **THEN** the header updates to show the selected count and enables bulk action buttons (e.g. Export CSV, Delete).

---

### Requirement: Student Directory Management
The admin panel must support complete CRUD operations and onboarding flows for students.

#### Scenario: Onboard New Student
- **WHEN** the user fills out the registration form with student details and submits
- **THEN** a new student record is created in the database via the backend proxy API, and the list updates.

#### Scenario: Filter Students by Status or Course
- **WHEN** the admin changes the list filter dropdown to "Pending" or selects a specific course
- **THEN** the list dynamically filters to display matching student records.

---

### Requirement: Mentor Directory Management
The admin panel must support registering, listing, and editing mentors.

#### Scenario: Register New Mentor
- **WHEN** the admin inputs the mentor name and email, and submits the form
- **THEN** a user account with the "mentor" role is created via the backend proxy API, and the mentor is added to the directory.
