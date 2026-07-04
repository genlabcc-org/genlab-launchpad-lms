package cc.genlab.genlablaunchpadlmsapi.controller.admin;

import cc.genlab.genlablaunchpadlmsapi.config.SupabaseProperties;
import cc.genlab.genlablaunchpadlmsapi.model.dto.StudentDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.CreateUserRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.UpdateStudentRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.response.CreateUserResponse;
import cc.genlab.genlablaunchpadlmsapi.model.enums.Gender;
import cc.genlab.genlablaunchpadlmsapi.model.enums.StudentType;
import cc.genlab.genlablaunchpadlmsapi.service.RoleService;
import cc.genlab.genlablaunchpadlmsapi.service.port.StudentServicePort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import cc.genlab.genlablaunchpadlmsapi.aspect.RoleCheckAspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminStudentController.class)
@Import({RoleCheckAspect.class, org.springframework.boot.autoconfigure.aop.AopAutoConfiguration.class})
class AdminStudentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StudentServicePort studentService;

    @MockitoBean
    private RoleService roleService;

    @MockitoBean
    private SupabaseProperties supabaseProperties;

    private UUID studentId;
    private StudentDto studentDto;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();
        studentDto = new StudentDto(
                studentId,
                "Test Student",
                "test@example.com",
                "+1234567890",
                Gender.MALE,
                "+0987654321",
                "123 Main St",
                "address_proof_key",
                "http://cdn/address_proof",
                "College of Engineering",
                StudentType.STUDENT,
                "direct",
                null, // paymentType
                null, // registeredCourseId
                null, // interestedCourseId (added)
                null, // assignedMentorId
                null, // timeSlotId
                null, // startDate
                null, // endDate
                java.math.BigDecimal.ZERO, // totalAmount
                java.math.BigDecimal.ZERO, // pendingAmount
                "profile_photo_key",
                "http://cdn/profile_photo",
                OffsetDateTime.now()
        );
    }

    @Test
    @WithMockUser(username = "admin-user")
    void getAllStudents_asAdmin_shouldReturnList() throws Exception {
        // Arrange
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(studentService.getAllStudents()).thenReturn(List.of(studentDto));

        // Act & Assert
        mockMvc.perform(get("/api/admin/students")
                        .requestAttr("userId", "admin-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Student"))
                .andExpect(jsonPath("$[0].email").value("test@example.com"));
    }

    @Test
    @WithMockUser(username = "student-user")
    void getAllStudents_asStudent_shouldReturnForbidden() throws Exception {
        // Arrange
        when(roleService.getRoleForUser("student-user")).thenReturn("student");

        // Act & Assert
        mockMvc.perform(get("/api/admin/students")
                        .requestAttr("userId", "student-user"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin-user")
    void getStudentById_asAdmin_shouldReturnStudent() throws Exception {
        // Arrange
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(studentService.getStudentProfile(studentId.toString())).thenReturn(studentDto);

        // Act & Assert
        mockMvc.perform(get("/api/admin/students/" + studentId)
                        .requestAttr("userId", "admin-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Student"))
                .andExpect(jsonPath("$.id").value(studentId.toString()));
    }

    @Test
    @WithMockUser(username = "admin-user")
    void createStudent_withValidData_shouldReturnCreated() throws Exception {
        // Arrange
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        
        CreateUserResponse response = CreateUserResponse.builder()
                .userId(studentId.toString())
                .role("student")
                .name("New Student")
                .message("User created successfully")
                .build();
        when(studentService.createStudent(any(CreateUserRequest.class))).thenReturn(response);

        String requestBody = """
                {
                  "name": "New Student",
                  "phone": "+1987654321",
                  "email": "new@example.com"
                }
                """;

        // Act & Assert
        mockMvc.perform(post("/api/admin/students")
                        .requestAttr("userId", "admin-user")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(studentId.toString()))
                .andExpect(jsonPath("$.role").value("student"));
    }

    @Test
    @WithMockUser(username = "admin-user")
    void createStudent_withoutName_shouldReturnBadRequest() throws Exception {
        // Arrange
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(studentService.createStudent(any(CreateUserRequest.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "name is required"));

        String requestBody = """
                {
                  "phone": "+1987654321",
                  "email": "new@example.com"
                }
                """;

        // Act & Assert
        mockMvc.perform(post("/api/admin/students")
                        .requestAttr("userId", "admin-user")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "admin-user")
    void createStudent_withInvalidPhone_shouldReturnBadRequest() throws Exception {
        // Arrange
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(studentService.createStudent(any(CreateUserRequest.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "phone starting with + is required"));

        String requestBody = """
                {
                  "name": "New Student",
                  "phone": "1987654321",
                  "email": "new@example.com"
                }
                """;

        // Act & Assert
        mockMvc.perform(post("/api/admin/students")
                        .requestAttr("userId", "admin-user")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "admin-user")
    void updateStudent_withValidData_shouldReturnUpdated() throws Exception {
        // Arrange
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(studentService.updateStudent(eq(studentId), any(UpdateStudentRequest.class))).thenReturn(studentDto);

        String requestBody = """
                {
                  "name": "Updated Name",
                  "emergencyMobile": "+1122334455"
                }
                """;

        // Act & Assert
        mockMvc.perform(put("/api/admin/students/" + studentId)
                        .requestAttr("userId", "admin-user")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Student"));
    }

    @Test
    @WithMockUser(username = "admin-user")
    void deleteStudent_shouldReturnNoContent() throws Exception {
        // Arrange
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        doNothing().when(studentService).deleteStudent(studentId);

        // Act & Assert
        mockMvc.perform(delete("/api/admin/students/" + studentId)
                        .requestAttr("userId", "admin-user")
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }
}
