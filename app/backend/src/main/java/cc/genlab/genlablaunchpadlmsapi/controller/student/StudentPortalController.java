package cc.genlab.genlablaunchpadlmsapi.controller.student;

import cc.genlab.genlablaunchpadlmsapi.annotation.RequiresRole;
import cc.genlab.genlablaunchpadlmsapi.model.dto.response.MessageResponse;
import cc.genlab.genlablaunchpadlmsapi.model.dto.StudentDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.StudentEnrollmentDto;
import cc.genlab.genlablaunchpadlmsapi.service.StudentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/student")
@RequiresRole("student")
@RequiredArgsConstructor
public class StudentPortalController {

    private final StudentService studentService;

    @GetMapping("/dashboard")
    public MessageResponse dashboard() {
        return new MessageResponse("Welcome student");
    }

    @GetMapping("/profile")
    public StudentDto profile(HttpServletRequest request) {
        String userIdStr = (String) request.getAttribute("userId");
        return studentService.getStudentProfile(userIdStr);
    }

    @GetMapping("/enrollments/current")
    public StudentEnrollmentDto currentEnrollment(HttpServletRequest request) {
        String userIdStr = (String) request.getAttribute("userId");
        return studentService.getCurrentEnrollment(userIdStr);
    }

    @GetMapping("/enrollments/past")
    public List<StudentEnrollmentDto> pastEnrollments(HttpServletRequest request) {
        String userIdStr = (String) request.getAttribute("userId");
        return studentService.getPastEnrollments(userIdStr);
    }
}
