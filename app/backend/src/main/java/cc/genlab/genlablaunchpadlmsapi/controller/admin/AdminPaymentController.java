package cc.genlab.genlablaunchpadlmsapi.controller.admin;

import cc.genlab.genlablaunchpadlmsapi.annotation.RequiresRole;
import cc.genlab.genlablaunchpadlmsapi.model.dto.PaymentDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.RecordPaymentRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.UpdatePaymentRequest;
import cc.genlab.genlablaunchpadlmsapi.service.port.PaymentServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Admin CRUD for payments. Depends on PaymentServicePort (not AdminService).
 */
@RestController
@RequestMapping("/api/admin/payments")
@RequiresRole("admin")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final PaymentServicePort paymentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentDto recordPayment(@RequestBody RecordPaymentRequest request) {
        return paymentService.recordPayment(request);
    }

    @GetMapping
    public List<PaymentDto> listPayments() {
        return paymentService.listAllPayments();
    }

    @GetMapping("/pending")
    public List<PaymentDto> getPendingPayments() {
        return paymentService.getPendingPaymentsSortedByDueDate();
    }

    @GetMapping("/{id}")
    public PaymentDto getPayment(@PathVariable UUID id) {
        return paymentService.getPaymentById(id);
    }

    @PutMapping("/{id}")
    public PaymentDto updatePayment(@PathVariable UUID id, @RequestBody UpdatePaymentRequest request) {
        return paymentService.updatePayment(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePayment(@PathVariable UUID id) {
        paymentService.deletePayment(id);
    }
}
