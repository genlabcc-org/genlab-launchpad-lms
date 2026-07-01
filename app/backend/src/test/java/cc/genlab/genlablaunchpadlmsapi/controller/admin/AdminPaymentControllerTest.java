package cc.genlab.genlablaunchpadlmsapi.controller.admin;

import cc.genlab.genlablaunchpadlmsapi.config.SupabaseProperties;
import cc.genlab.genlablaunchpadlmsapi.model.dto.PaymentDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.RecordPaymentRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.UpdatePaymentRequest;
import cc.genlab.genlablaunchpadlmsapi.model.enums.PaymentMethod;
import cc.genlab.genlablaunchpadlmsapi.model.enums.PaymentStatus;
import cc.genlab.genlablaunchpadlmsapi.service.RoleService;
import cc.genlab.genlablaunchpadlmsapi.service.port.PaymentServicePort;
import cc.genlab.genlablaunchpadlmsapi.aspect.RoleCheckAspect;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
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

@WebMvcTest(AdminPaymentController.class)
@Import({RoleCheckAspect.class, org.springframework.boot.autoconfigure.aop.AopAutoConfiguration.class})
class AdminPaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PaymentServicePort paymentService;

    @MockitoBean
    private RoleService roleService;

    @MockitoBean
    private SupabaseProperties supabaseProperties;

    private UUID paymentId;
    private UUID enrollmentId;
    private PaymentDto paymentDto;

    @BeforeEach
    void setUp() {
        paymentId = UUID.randomUUID();
        enrollmentId = UUID.randomUUID();
        paymentDto = new PaymentDto(
                paymentId,
                enrollmentId,
                BigDecimal.valueOf(100.0),
                LocalDate.now(),
                LocalDate.now().plusMonths(1),
                BigDecimal.valueOf(100.0),
                PaymentMethod.UPI,
                PaymentStatus.COMPLETED,
                "tx123",
                "Notes"
        );
    }

    @Test
    @WithMockUser(username = "admin-user")
    void recordPayment_asAdmin_shouldReturnCreated() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        String requestJson = """
                {
                  "enrollmentId": "%s",
                  "amount": 100.0,
                  "paymentDate": "%s",
                  "nextDueDate": "%s",
                  "nextDueAmount": 100.0,
                  "paymentMethod": "UPI",
                  "status": "COMPLETED",
                  "transactionReference": "tx123",
                  "notes": "Notes"
                }
                """.formatted(enrollmentId, LocalDate.now(), LocalDate.now().plusMonths(1));

        when(paymentService.recordPayment(any(RecordPaymentRequest.class))).thenReturn(paymentDto);

        mockMvc.perform(post("/api/admin/payments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson)
                        .requestAttr("userId", "admin-user"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(paymentId.toString()))
                .andExpect(jsonPath("$.amount").value(100.0));
    }

    @Test
    @WithMockUser(username = "admin-user")
    void listPayments_asAdmin_shouldReturnList() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(paymentService.listAllPayments()).thenReturn(List.of(paymentDto));

        mockMvc.perform(get("/api/admin/payments")
                        .requestAttr("userId", "admin-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(paymentId.toString()));
    }

    @Test
    @WithMockUser(username = "admin-user")
    void getPendingPayments_asAdmin_shouldReturnSortedList() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(paymentService.getPendingPaymentsSortedByDueDate()).thenReturn(List.of(paymentDto));

        mockMvc.perform(get("/api/admin/payments/pending")
                        .requestAttr("userId", "admin-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(paymentId.toString()));
    }

    @Test
    @WithMockUser(username = "admin-user")
    void getPayment_asAdmin_shouldReturnPayment() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(paymentService.getPaymentById(paymentId)).thenReturn(paymentDto);

        mockMvc.perform(get("/api/admin/payments/" + paymentId)
                        .requestAttr("userId", "admin-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(paymentId.toString()));
    }

    @Test
    @WithMockUser(username = "admin-user")
    void updatePayment_asAdmin_shouldReturnUpdated() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        String requestJson = """
                {
                  "amount": 120.0,
                  "paymentDate": "%s",
                  "nextDueDate": "%s",
                  "nextDueAmount": 120.0,
                  "paymentMethod": "UPI",
                  "status": "COMPLETED",
                  "transactionReference": "tx123_updated",
                  "notes": "Updated Notes"
                }
                """.formatted(LocalDate.now(), LocalDate.now().plusMonths(1));

        PaymentDto updatedDto = new PaymentDto(
                paymentId,
                enrollmentId,
                BigDecimal.valueOf(120.0),
                LocalDate.now(),
                LocalDate.now().plusMonths(1),
                BigDecimal.valueOf(120.0),
                PaymentMethod.UPI,
                PaymentStatus.COMPLETED,
                "tx123_updated",
                "Updated Notes"
        );
        when(paymentService.updatePayment(eq(paymentId), any(UpdatePaymentRequest.class))).thenReturn(updatedDto);

        mockMvc.perform(put("/api/admin/payments/" + paymentId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson)
                        .requestAttr("userId", "admin-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(120.0))
                .andExpect(jsonPath("$.transactionReference").value("tx123_updated"));
    }

    @Test
    @WithMockUser(username = "admin-user")
    void deletePayment_asAdmin_shouldReturnNoContent() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        doNothing().when(paymentService).deletePayment(paymentId);

        mockMvc.perform(delete("/api/admin/payments/" + paymentId)
                        .with(csrf())
                        .requestAttr("userId", "admin-user"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(username = "student-user")
    void recordPayment_asStudent_shouldReturnForbidden() throws Exception {
        when(roleService.getRoleForUser("student-user")).thenReturn("student");

        mockMvc.perform(post("/api/admin/payments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}")
                        .requestAttr("userId", "student-user"))
                .andExpect(status().isForbidden());
    }
}
