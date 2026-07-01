package cc.genlab.genlablaunchpadlmsapi.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import cc.genlab.genlablaunchpadlmsapi.model.dto.response.PresignedUrlResponse;
import cc.genlab.genlablaunchpadlmsapi.config.AwsProperties;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class StorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final AwsProperties awsProperties;

    private String getBucketName() {
        return awsProperties.getS3().getBucket();
    }

    private String getCdnBaseUrl() {
        return awsProperties.getCdn().getUrl();
    }

    @PostConstruct
    public void init() {
        String bucketName = getBucketName();
        try {
            s3Client.headBucket(HeadBucketRequest.builder()
                    .bucket(bucketName)
                    .build());
            log.info("S3 bucket '{}' already exists.", bucketName);
        } catch (NoSuchBucketException e) {
            log.info("S3 bucket '{}' does not exist. Creating it...", bucketName);
            s3Client.createBucket(CreateBucketRequest.builder()
                    .bucket(bucketName)
                    .build());
            log.info("S3 bucket '{}' created successfully.", bucketName);
        } catch (Exception e) {
            log.warn("Could not check/create S3 bucket '{}': {}", bucketName, e.getMessage());
        }
    }

    /**
     * Resolves the public CDN URL for an S3 object key.
     */
    public String resolveCdnUrl(String key) {
        if (key == null || key.trim().isEmpty()) {
            return null;
        }
        String cleanKey = key.startsWith("/") ? key.substring(1) : key;
        String cdnBaseUrl = getCdnBaseUrl();
        return cdnBaseUrl.endsWith("/") ? cdnBaseUrl + cleanKey : cdnBaseUrl + "/" + cleanKey;
    }

    /**
     * Generates a presigned PUT URL for uploading a file to S3.
     */
    public String generatePresignedUploadUrl(String key, String contentType) {
        String bucketName = getBucketName();
        log.info("Generating presigned upload URL for key: {}, contentType: {} in bucket: {}", key, contentType, bucketName);
        
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .putObjectRequest(putObjectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
        return presignedRequest.url().toString();
    }

    /**
     * Generates a presigned GET URL for retrieving a file from S3.
     */
    public String generatePresignedDownloadUrl(String key) {
        if (key == null || key.trim().isEmpty()) {
            return null;
        }
        String bucketName = getBucketName();
        log.info("Generating presigned download URL for key: {} in bucket: {}", key, bucketName);

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .getObjectRequest(getObjectRequest)
                .build();

        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
        return presignedRequest.url().toString();
    }

    /**
     * Deletes an object from S3.
     */
    public void deleteObject(String key) {
        if (key == null || key.trim().isEmpty()) {
            return;
        }
        String bucketName = getBucketName();
        log.info("Deleting S3 object for key: {} in bucket: {}", key, bucketName);
        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();
            s3Client.deleteObject(deleteRequest);
        } catch (Exception e) {
            log.error("Failed to delete S3 object: {}", e.getMessage(), e);
        }
    }

    /**
     * Generates a unique key for the specified prefix and content-type,
     * creates a presigned upload URL, and returns both details.
     */
    public PresignedUrlResponse getPresignedUploadDetails(String prefix, String contentType) {
        String extension = contentType.contains("/") ? contentType.substring(contentType.lastIndexOf("/") + 1) : "jpg";
        if (extension.equals("jpeg")) {
            extension = "jpg";
        }
        String key = prefix + "/" + java.util.UUID.randomUUID() + "." + extension;
        String uploadUrl = generatePresignedUploadUrl(key, contentType);
        return new PresignedUrlResponse(uploadUrl, key);
    }

    /**
     * Uploads raw bytes to S3 with a specific content type.
     */
    public void uploadBytes(String key, byte[] bytes, String contentType) {
        String bucketName = getBucketName();
        log.info("Uploading {} bytes to S3 key: {} in bucket: {}", bytes.length, key, bucketName);
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(contentType)
                    .build();
            s3Client.putObject(putObjectRequest, software.amazon.awssdk.core.sync.RequestBody.fromBytes(bytes));
        } catch (Exception e) {
            log.error("Failed to upload bytes to S3: {}", e.getMessage(), e);
            throw new RuntimeException("S3 Upload failed: " + e.getMessage(), e);
        }
    }
}
