package cc.genlab.genlablaunchpadlmsapi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.S3Presigner.Builder;

import java.net.URI;

@Configuration
@RequiredArgsConstructor
public class S3Config {

    private final AwsProperties awsProperties;

    @Bean
    public S3Client s3Client() {
        String region = awsProperties.getS3().getRegion();
        String endpointOverride = awsProperties.getS3().getEndpoint();

        S3ClientBuilder builder = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.builder().build());

        if (endpointOverride != null && !endpointOverride.trim().isEmpty()) {
            builder.endpointOverride(URI.create(endpointOverride))
                   .forcePathStyle(true);
        }

        return builder.build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        String region = awsProperties.getS3().getRegion();
        String endpointOverride = awsProperties.getS3().getEndpoint();

        Builder builder = S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.builder().build());

        if (endpointOverride != null && !endpointOverride.trim().isEmpty()) {
            builder.endpointOverride(URI.create(endpointOverride));
        }

        return builder.build();
    }
}
