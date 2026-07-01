package cc.genlab.genlablaunchpadlmsapi.model.dto.request;

public record PhoneVerifyRequest(
    String phone,
    String token
) {}
