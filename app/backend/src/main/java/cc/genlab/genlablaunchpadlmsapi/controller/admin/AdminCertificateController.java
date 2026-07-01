package cc.genlab.genlablaunchpadlmsapi.controller.admin;

import cc.genlab.genlablaunchpadlmsapi.annotation.RequiresRole;
import cc.genlab.genlablaunchpadlmsapi.model.dto.response.MessageResponse;
import cc.genlab.genlablaunchpadlmsapi.service.port.CertificateServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Admin endpoint for certificate generation.
 */
@RestController
@RequestMapping("/api/admin")
@RequiresRole("admin")
@RequiredArgsConstructor
public class AdminCertificateController {

    private final CertificateServicePort certificateService;

    @PostMapping("/enrollments/{enrollmentId}/certificate/generate")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public MessageResponse generateCertificate(@PathVariable UUID enrollmentId) {
        certificateService.queueCertificateGeneration(enrollmentId);
        return new MessageResponse("Certificate generation queued");
    }
}
