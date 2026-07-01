## 1. Cloud Infrastructure

- [x] 1.1 Create S3 assets Terraform module under `deployments/terraform/modules/s3_assets/` declaring a private encrypted bucket and bucket policies.
- [x] 1.2 Reference the new module in environment `main.tf` files and export the bucket name configurations.
- [x] 1.3 Update AWS Secrets Manager secret variables to expose S3 bucket name details to the Spring Boot backend.

## 2. Database Migrations

- [x] 2.1 Create a Supabase migration file under `deployments/supabase/migrations/` adding `profile_photo_key` and `address_proof_key` columns to the `students` table.

## 3. Backend Implementation

- [x] 3.1 Update backend `pom.xml` with AWS SDK v2 S3 client library.
- [x] 3.2 Add configuration keys for S3 region and bucket in backend application files.
- [x] 3.3 Create `S3Config.java` to declare `S3Client` and `S3Presigner` beans.
- [x] 3.4 Update backend `Student` entity to reference profile photo and address proof keys.
- [x] 3.5 Create `StorageService.java` to generate PUT and GET presigned URLs and handle S3 object deletions.
- [x] 3.6 Implement `AssetController.java` exposing `/api/assets/student/profile-photo/presign-upload` and `/api/assets/student/address-proof/presign-upload` endpoints.

## 4. Frontend Implementation

- [ ] 4.1 Update frontend API service layer (Axios) to call backend endpoints for presigned GET/PUT URLs.
- [ ] 4.2 Update frontend Zustand data layer to manage upload states and URLs.
- [ ] 4.3 Modify the Student Onboarding Form in the View layer to upload files directly to S3 using PUT URLs.
- [ ] 4.4 Update Student details view components to retrieve and render images via presigned GET URLs.
