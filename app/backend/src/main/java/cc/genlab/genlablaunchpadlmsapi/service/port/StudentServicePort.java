package cc.genlab.genlablaunchpadlmsapi.service.port;

import cc.genlab.genlablaunchpadlmsapi.model.dto.StudentDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.StudentEnrollmentDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.CreateUserRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.UpdateStudentRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.response.CreateUserResponse;

import java.util.List;
import java.util.UUID;

/**
 * Port interface for student domain operations.
 * Controllers depend on this interface, not the concrete StudentService.
 */
public interface StudentServicePort {

    List<StudentDto> getAllStudents();

    StudentDto getStudentProfile(String userIdStr);

    StudentEnrollmentDto getCurrentEnrollment(String userIdStr);

    List<StudentEnrollmentDto> getPastEnrollments(String userIdStr);

    CreateUserResponse createStudent(CreateUserRequest request);

    StudentDto updateStudent(UUID id, UpdateStudentRequest request);

    void deleteStudent(UUID id);
}
