package cc.genlab.genlablaunchpadlmsapi.service.port;

import cc.genlab.genlablaunchpadlmsapi.model.dto.PaymentDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.RecordPaymentRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.UpdatePaymentRequest;

import java.util.List;
import java.util.UUID;

/**
 * Port interface for payment domain operations.
 * Controllers depend on this interface, not the concrete PaymentService.
 */
public interface PaymentServicePort {

    List<PaymentDto> getPaymentsByStudentId(UUID studentId);

    List<PaymentDto> getEnrollmentPayments(UUID enrollmentId, String userId, String userRole);

    PaymentDto getEnrollmentPaymentDetails(UUID enrollmentId, UUID paymentId, String userId, String userRole);

    List<PaymentDto> listAllPayments();

    List<PaymentDto> getPendingPaymentsSortedByDueDate();

    List<PaymentDto> getPaymentsByEnrollmentId(UUID enrollmentId);

    PaymentDto getPaymentById(UUID id);

    PaymentDto recordPayment(RecordPaymentRequest request);

    PaymentDto updatePayment(UUID id, UpdatePaymentRequest request);

    void deletePayment(UUID id);
}
