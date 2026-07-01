## Context

The GenLab Launchpad LMS application allows admins to onboard students and upload verification files (Aadhar card/Driving License images) and profile photos. To ensure durability, security, and scalability, these assets must be stored in AWS S3 instead of local directories. 

## Goals / Non-Goals

**Goals:**
- Provision a secure, private AWS S3 bucket for student uploads via Terraform.
- Configure Spring Boot with the AWS Java SDK v2 S3 client.
- Generate short-lived presigned URLs (PUT for uploads, GET for downloads) to delegate transfers securely.
- Store object keys in the database rather than absolute URLs.

**Non-Goals:**
- Setting up a public CloudFront distribution for user assets.
- Building complex file search or categorization tools.

## Decisions

- **Private S3 Bucket & CORS**: The S3 bucket will block all public access. The bucket will have a CORS policy allowing PUT/GET requests from validated origins (the application's frontend URLs).
- **Presigned Upload & Retrieval Endpoints**: Expose two distinct REST endpoints on the backend controller layer:
  - `/api/assets/student/profile-photo/presign-upload` (GET): Generates a secure S3 PUT URL for profile photos using S3 key prefix `profile-photos/`.
  - `/api/assets/student/address-proof/presign-upload` (GET): Generates a secure S3 PUT URL for address proof documents using S3 key prefix `address-proofs/`.
  - The client uploads files directly to S3 using these PUT URLs and then submits the relative S3 object keys (`profile-photo-key`, `address-proof-key`) to the student creation/onboarding API endpoint. The backend validates and updates the database record fields.
- **IAM Instance Profile Role**: The Spring Boot app running on the EC2 instance will inherit S3 write/read permissions from the instance profile. We will not use hardcoded access keys in `.env` configurations.

## Risks / Trade-offs

- **CORS Management**: Direct client-side uploads require CORS headers on S3. When adding staging/prod domains, CORS configurations in Terraform must be updated.
- **Database Portability**: Storing S3 relative keys (e.g., `proofs/{uuid}`) allows migration to alternative object storage providers without modifying database records.
