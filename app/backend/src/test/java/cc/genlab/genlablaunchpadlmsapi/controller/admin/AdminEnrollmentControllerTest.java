package cc.genlab.genlablaunchpadlmsapi.controller.admin;

import cc.genlab.genlablaunchpadlmsapi.config.SupabaseProperties;
import cc.genlab.genlablaunchpadlmsapi.model.dto.EnrollmentDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.EnrollmentRequest;
import cc.genlab.genlablaunchpadlmsapi.service.EnrollmentService;
import cc.genlab.genlablaunchpadlmsapi.service.RoleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import cc.genlab.genlablaunchpadlmsapi.aspect.RoleCheckAspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminEnrollmentController.class)
@Import({RoleCheckAspect.class, org.springframework.boot.autoconfigure.aop.AopAutoConfiguration.class})
class AdminEnrollmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EnrollmentService enrollmentService;

    @MockitoBean
    private RoleService roleService;

    @MockitoBean
    private SupabaseProperties supabaseProperties;

    private UUID enrollmentId;
    private EnrollmentDto enrollmentDto;

    @BeforeEach
    void setUp() {
        enrollmentId = UUID.randomUUID();
        enrollmentDto = new EnrollmentDto(
                enrollmentId,
                null,
                null,
                "active",
                "full",
                java.math.BigDecimal.valueOf(199.99),
                java.math.BigDecimal.valueOf(199.99),
                List.of(),
                null,
                "JULY BATCH 1",
                OffsetDateTime.now()
        );
    }

    @Test
    @WithMockUser(username = "admin-user")
    void getAllEnrollments_asAdmin_shouldReturnList() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(enrollmentService.getAllEnrollments()).thenReturn(List.of(enrollmentDto));

        mockMvc.perform(get("/api/admin/enrollments")
                        .requestAttr("userId", "admin-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("active"))
                .andExpect(jsonPath("$[0].id").value(enrollmentId.toString()));
    }

    @Test
    @WithMockUser(username = "student-user")
    void getAllEnrollments_asStudent_shouldReturnForbidden() throws Exception {
        when(roleService.getRoleForUser("student-user")).thenReturn("student");

        mockMvc.perform(get("/api/admin/enrollments")
                        .requestAttr("userId", "student-user"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin-user")
    void getEnrollmentById_asAdmin_shouldReturnEnrollment() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(enrollmentService.getEnrollmentById(enrollmentId)).thenReturn(enrollmentDto);

        mockMvc.perform(get("/api/admin/enrollments/" + enrollmentId)
                        .requestAttr("userId", "admin-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("active"))
                .andExpect(jsonPath("$.id").value(enrollmentId.toString()));
    }

    @Test
    @WithMockUser(username = "admin-user")
    void createEnrollment_withValidData_shouldReturnCreated() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(enrollmentService.createEnrollment(any(EnrollmentRequest.class))).thenReturn(enrollmentDto);

        String requestBody = """
                {
                  "studentId": "00000000-0000-0000-0000-000000000001",
                  "courseId": "00000000-0000-0000-0000-000000000002",
                  "mentorId": "00000000-0000-0000-0000-000000000003",
                  "slotId": "00000000-0000-0000-0000-000000000004",
                  "startDate": "2026-07-01",
                  "endDate": "2026-08-01",
                  "paymentType": "full",
                  "totalAmount": 199.99
                }
                """;

        mockMvc.perform(post("/api/admin/enrollments")
                        .requestAttr("userId", "admin-user")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("active"))
                .andExpect(jsonPath("$.totalAmount").value(199.99));
    }

    @Test
    @WithMockUser(username = "admin-user")
    void createEnrollmentsBulk_withValidData_shouldReturnCreated() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(enrollmentService.createEnrollmentsBulk(anyList())).thenReturn(List.of(enrollmentDto));

        String requestBody = """
                [
                  {
                    "studentId": "00000000-0000-0000-0000-000000000001",
                    "courseId": "00000000-0000-0000-0000-000000000002",
                    "mentorId": "00000000-0000-0000-0000-000000000003",
                    "slotId": "00000000-0000-0000-0000-000000000004",
                    "startDate": "2026-07-01",
                    "endDate": "2026-08-01",
                    "paymentType": "full",
                    "totalAmount": 199.99
                  }
                ]
                """;

        mockMvc.perform(post("/api/admin/enrollments/bulk")
                        .requestAttr("userId", "admin-user")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$[0].status").value("active"))
                .andExpect(jsonPath("$[0].totalAmount").value(199.99));
    }

    @Test
    @WithMockUser(username = "admin-user")
    void updateEnrollment_withValidData_shouldReturnUpdated() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(enrollmentService.updateEnrollment(eq(enrollmentId), any(EnrollmentRequest.class))).thenReturn(enrollmentDto);

        String requestBody = """
                {
                  "status": "completed"
                }
                """;

        mockMvc.perform(put("/api/admin/enrollments/" + enrollmentId)
                        .requestAttr("userId", "admin-user")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("active"));
    }

    @Test
    @WithMockUser(username = "admin-user")
    void deleteEnrollment_shouldReturnNoContent() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        doNothing().when(enrollmentService).deleteEnrollment(enrollmentId);

        mockMvc.perform(delete("/api/admin/enrollments/" + enrollmentId)
                        .requestAttr("userId", "admin-user")
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }
}
