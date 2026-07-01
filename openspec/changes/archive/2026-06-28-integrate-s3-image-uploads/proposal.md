## Why

To support scaling student onboarding, the platform requires a durable, secure, and highly available storage solution for user images (profile photos and address proofs). Exposing physical server paths or storing image blobs in the relational database leads to performance bottlenecks and storage degradation. AWS S3 offers a secure, scalable object storage mechanism. By keeping the S3 bucket private and using short-lived backend-generated presigned URLs, we prevent unauthorized access to sensitive documents.

## What Changes

1. **Infrastructure**: Declare an environment-specific, private AWS S3 bucket in Terraform.
2. **Backend Storage Service**: Implement an S3 storage management service in the Spring Boot backend using the AWS SDK client.
3. **Database & Routing Logic**: Update the student tables to store S3 object keys (e.g., UUID-based references) in specific columns.
4. **API Integration**: Implement 2 distinct endpoints to fetch secure presigned URLs: one for student profile photo uploads, and one for student address proof document uploads. The backend will handle routing and verify security roles.

## Capabilities

### New Capabilities
- `s3-asset-storage`: Secure asset upload and retrieval logic using short-lived AWS S3 presigned URLs.

### Modified Capabilities
- `aws-infra-provisioning`: Declare and provision a private, encrypted AWS S3 storage bucket.

## Impact

- **Infrastructure**: Terraform environment configurations and state outputs.
- **Backend Application**: Maven dependencies, configuration files, S3 client beans, and database model updates.
- **Database Schema**: Column alterations mapping files to object storage keys.
- **Frontend App**: Alignment with endpoints supporting presigned upload/download routes.
