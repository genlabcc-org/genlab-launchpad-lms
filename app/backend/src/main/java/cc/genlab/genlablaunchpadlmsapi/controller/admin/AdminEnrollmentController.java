package cc.genlab.genlablaunchpadlmsapi.controller.admin;

import cc.genlab.genlablaunchpadlmsapi.annotation.RequiresRole;
import cc.genlab.genlablaunchpadlmsapi.model.dto.EnrollmentDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.EnrollmentRequest;
import cc.genlab.genlablaunchpadlmsapi.service.port.EnrollmentServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/enrollments")
@RequiresRole("admin")
@RequiredArgsConstructor
public class AdminEnrollmentController {

    private final EnrollmentServicePort enrollmentService;

    @GetMapping
    public List<EnrollmentDto> getAllEnrollments() {
        return enrollmentService.getAllEnrollments();
    }

    @GetMapping("/{id}")
    public EnrollmentDto getEnrollmentById(@PathVariable UUID id) {
        return enrollmentService.getEnrollmentById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EnrollmentDto createEnrollment(@RequestBody EnrollmentRequest request) {
        return enrollmentService.createEnrollment(request);
    }

    @PostMapping("/bulk")
    @ResponseStatus(HttpStatus.CREATED)
    public List<EnrollmentDto> createEnrollmentsBulk(@RequestBody List<EnrollmentRequest> requests) {
        return enrollmentService.createEnrollmentsBulk(requests);
    }

    @PutMapping("/{id}")
    public EnrollmentDto updateEnrollment(@PathVariable UUID id, @RequestBody EnrollmentRequest request) {
        return enrollmentService.updateEnrollment(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEnrollment(@PathVariable UUID id) {
        enrollmentService.deleteEnrollment(id);
    }
}
