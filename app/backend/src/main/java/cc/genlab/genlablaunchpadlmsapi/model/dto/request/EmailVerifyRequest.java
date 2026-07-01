package cc.genlab.genlablaunchpadlmsapi.model.dto.request;

public record EmailVerifyRequest(
    String email,
    String token
) {}
