## ADDED Requirements

### Requirement: Private Asset Storage Bucket
The AWS infrastructure module SHALL provision a private S3 bucket dedicated to student asset storage (profile photos and address proofs).

#### Scenario: Verify private S3 bucket parameters
- **WHEN** the S3 assets module is applied
- **THEN** it MUST provision an S3 bucket with all public access blocked, bucket-level encryption enabled, and output the bucket's name.
