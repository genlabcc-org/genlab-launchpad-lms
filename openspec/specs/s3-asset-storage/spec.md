# s3-asset-storage Specification

## Purpose
TBD - created by archiving change integrate-s3-image-uploads. Update Purpose after archive.

## Requirements

### Requirement: Secure Presigned Upload Endpoints
The Spring Boot backend SHALL expose two separate endpoints for generating secure presigned S3 PUT URLs:
- `/api/assets/student/profile-photo/presign-upload` (GET): for student profile photos.
- `/api/assets/student/address-proof/presign-upload` (GET): for student address proof files.

#### Scenario: Generate profile photo presigned upload URL
- **WHEN** an Admin requests a profile photo upload URL with a valid target file extension
- **THEN** the backend MUST generate a presigned PUT URL pointing to the `profile-photos/` S3 key space, valid for 15 minutes.

#### Scenario: Generate address proof presigned upload URL
- **WHEN** an Admin requests an address proof upload URL with a valid target file extension
- **THEN** the backend MUST generate a presigned PUT URL pointing to the `address-proofs/` S3 key space, valid for 15 minutes.

### Requirement: Secure Presigned Retrieval URLs
The Spring Boot backend SHALL generate short-lived presigned GET URLs for rendering uploaded assets.

#### Scenario: Request presigned retrieval URL
- **WHEN** an authorized client requests the retrieval link for a student's profile photo or address proof using the stored S3 key
- **THEN** the backend MUST return a presigned GET URL valid for 15 minutes, allowing secure rendering of the asset.

### Requirement: Object Deletion
The Spring Boot backend SHALL automatically clean up S3 objects when the associated student records are deleted.

#### Scenario: Delete student record
- **WHEN** a student record is successfully deleted from the system
- **THEN** the backend MUST invoke S3 object deletion tasks to clean up their uploaded files from S3.

### Requirement: AWS Credentials Configuration
The Spring Boot backend SHALL configure the AWS S3 SDK clients utilizing the default credentials provider chain to resolve target credentials dynamically.

#### Scenario: Instance Profile Credentials in EC2 Environment
- **WHEN** the backend runs on the deployed EC2 compute instance
- **THEN** S3 clients MUST authenticate using the attached IAM Instance Profile temporary security credentials.

#### Scenario: Developer Credentials in Local Environment
- **WHEN** the backend runs in a local environment
- **THEN** S3 clients MUST resolve developer credentials from environment variables or local AWS configuration profiles.
