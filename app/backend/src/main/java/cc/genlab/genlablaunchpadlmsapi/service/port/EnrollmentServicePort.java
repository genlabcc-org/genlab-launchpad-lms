package cc.genlab.genlablaunchpadlmsapi.service.port;

import cc.genlab.genlablaunchpadlmsapi.model.dto.EnrollmentDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.EnrollmentRequest;

import java.util.List;
import java.util.UUID;

/**
 * Port interface for enrollment domain operations.
 */
public interface EnrollmentServicePort {

    List<EnrollmentDto> getAllEnrollments();

    EnrollmentDto getEnrollmentById(UUID id);

    EnrollmentDto createEnrollment(EnrollmentRequest request);

    List<EnrollmentDto> createEnrollmentsBulk(List<EnrollmentRequest> requests);

    EnrollmentDto updateEnrollment(UUID id, EnrollmentRequest request);

    void deleteEnrollment(UUID id);

    List<EnrollmentDto> bulkAssign(cc.genlab.genlablaunchpadlmsapi.model.dto.request.BulkAssignRequest request);
}
