package cc.genlab.genlablaunchpadlmsapi.controller.shared;

import cc.genlab.genlablaunchpadlmsapi.annotation.RequiresRole;
import cc.genlab.genlablaunchpadlmsapi.model.dto.PaymentDto;
import cc.genlab.genlablaunchpadlmsapi.service.PaymentService;
import cc.genlab.genlablaunchpadlmsapi.service.RoleService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/enrollments")
@RequiresRole({"admin", "student"})
public class SharedPaymentController {

    private final PaymentService paymentService;
    private final RoleService roleService;

    public SharedPaymentController(PaymentService paymentService, RoleService roleService) {
        this.paymentService = paymentService;
        this.roleService = roleService;
    }

    @GetMapping("/{enrollmentId}/payments")
    public List<PaymentDto> getEnrollmentPayments(
            @PathVariable UUID enrollmentId,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        String userRole = roleService.getRoleForUser(userId);
        return paymentService.getEnrollmentPayments(enrollmentId, userId, userRole);
    }

    @GetMapping("/{enrollmentId}/payments/{paymentId}")
    public PaymentDto getEnrollmentPaymentDetails(
            @PathVariable UUID enrollmentId,
            @PathVariable UUID paymentId,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        String userRole = roleService.getRoleForUser(userId);
        return paymentService.getEnrollmentPaymentDetails(enrollmentId, paymentId, userId, userRole);
    }
}
