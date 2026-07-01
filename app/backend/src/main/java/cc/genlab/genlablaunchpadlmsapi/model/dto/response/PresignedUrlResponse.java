package cc.genlab.genlablaunchpadlmsapi.model.dto.response;

public record PresignedUrlResponse(
    String url,
    String key
) {}
