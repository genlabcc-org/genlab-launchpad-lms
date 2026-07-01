package cc.genlab.genlablaunchpadlmsapi.service.port;

import java.util.UUID;

/**
 * Port interface for certificate domain operations.
 */
public interface CertificateServicePort {

    void queueCertificateGeneration(UUID enrollmentId);

    void generateAndUploadCertificate(UUID enrollmentId);
}
