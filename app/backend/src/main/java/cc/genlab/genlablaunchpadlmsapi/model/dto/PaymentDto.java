package cc.genlab.genlablaunchpadlmsapi.model.dto;

import cc.genlab.genlablaunchpadlmsapi.model.entity.Payment;
import cc.genlab.genlablaunchpadlmsapi.model.enums.PaymentMethod;
import cc.genlab.genlablaunchpadlmsapi.model.enums.PaymentStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PaymentDto(
    UUID id,
    UUID enrollmentId,
    BigDecimal amount,
    LocalDate paymentDate,
    LocalDate nextDueDate,
    BigDecimal nextDueAmount,
    PaymentMethod paymentMethod,
    PaymentStatus status,
    String transactionReference,
    String notes
) {
    public static PaymentDto fromEntity(Payment payment) {
        if (payment == null) return null;
        return new PaymentDto(
            payment.getId(),
            payment.getEnrollment().getId(),
            payment.getAmount(),
            payment.getPaymentDate(),
            payment.getNextDueDate(),
            payment.getNextDueAmount(),
            payment.getPaymentMethod(),
            payment.getStatus(),
            payment.getTransactionReference(),
            payment.getNotes()
        );
    }
}
