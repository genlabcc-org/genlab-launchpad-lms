package cc.genlab.genlablaunchpadlmsapi.controller.shared;

import cc.genlab.genlablaunchpadlmsapi.config.SupabaseProperties;
import cc.genlab.genlablaunchpadlmsapi.model.dto.PaymentDto;
import cc.genlab.genlablaunchpadlmsapi.model.enums.PaymentMethod;
import cc.genlab.genlablaunchpadlmsapi.model.enums.PaymentStatus;
import cc.genlab.genlablaunchpadlmsapi.service.PaymentService;
import cc.genlab.genlablaunchpadlmsapi.service.RoleService;
import cc.genlab.genlablaunchpadlmsapi.aspect.RoleCheckAspect;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SharedPaymentController.class)
@Import({RoleCheckAspect.class, org.springframework.boot.autoconfigure.aop.AopAutoConfiguration.class})
class SharedPaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PaymentService paymentService;

    @MockitoBean
    private RoleService roleService;

    @MockitoBean
    private SupabaseProperties supabaseProperties;

    private UUID enrollmentId;
    private UUID paymentId;
    private PaymentDto paymentDto;

    @BeforeEach
    void setUp() {
        enrollmentId = UUID.randomUUID();
        paymentId = UUID.randomUUID();
        paymentDto = new PaymentDto(
                paymentId,
                enrollmentId,
                BigDecimal.valueOf(250.0),
                LocalDate.now(),
                null,
                null,
                PaymentMethod.CARD,
                PaymentStatus.COMPLETED,
                "tx_shared",
                "Shared Notes"
        );
    }

    @Test
    @WithMockUser(username = "admin-user")
    void getEnrollmentPayments_asAdmin_shouldReturnPayments() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(paymentService.getEnrollmentPayments(enrollmentId, "admin-user", "admin"))
                .thenReturn(List.of(paymentDto));

        mockMvc.perform(get("/api/enrollments/" + enrollmentId + "/payments")
                        .requestAttr("userId", "admin-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(paymentId.toString()));
    }

    @Test
    @WithMockUser(username = "student-user")
    void getEnrollmentPayments_asStudent_shouldReturnPayments() throws Exception {
        when(roleService.getRoleForUser("student-user")).thenReturn("student");
        when(paymentService.getEnrollmentPayments(enrollmentId, "student-user", "student"))
                .thenReturn(List.of(paymentDto));

        mockMvc.perform(get("/api/enrollments/" + enrollmentId + "/payments")
                        .requestAttr("userId", "student-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(paymentId.toString()));
    }

    @Test
    @WithMockUser(username = "student-user")
    void getEnrollmentPaymentDetails_asStudent_shouldReturnPaymentDetails() throws Exception {
        when(roleService.getRoleForUser("student-user")).thenReturn("student");
        when(paymentService.getEnrollmentPaymentDetails(enrollmentId, paymentId, "student-user", "student"))
                .thenReturn(paymentDto);

        mockMvc.perform(get("/api/enrollments/" + enrollmentId + "/payments/" + paymentId)
                        .requestAttr("userId", "student-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(paymentId.toString()))
                .andExpect(jsonPath("$.notes").value("Shared Notes"));
    }

    @Test
    @WithMockUser(username = "mentor-user")
    void getEnrollmentPayments_asMentor_shouldReturnForbidden() throws Exception {
        when(roleService.getRoleForUser("mentor-user")).thenReturn("mentor");

        mockMvc.perform(get("/api/enrollments/" + enrollmentId + "/payments")
                        .requestAttr("userId", "mentor-user"))
                .andExpect(status().isForbidden());
    }
}
