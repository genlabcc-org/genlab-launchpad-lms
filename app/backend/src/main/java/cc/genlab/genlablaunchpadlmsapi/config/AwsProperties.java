package cc.genlab.genlablaunchpadlmsapi.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "aws")
@Getter
@Setter
public class AwsProperties {
    private final S3 s3 = new S3();
    private final Cdn cdn = new Cdn();

    @Getter
    @Setter
    public static class S3 {
        private String bucket;
        private String region = "ap-south-1";
        private String endpoint = "";
    }

    @Getter
    @Setter
    public static class Cdn {
        private String url;
    }
}
