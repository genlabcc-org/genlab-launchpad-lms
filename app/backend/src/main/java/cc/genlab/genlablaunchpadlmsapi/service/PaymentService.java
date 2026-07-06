package cc.genlab.genlablaunchpadlmsapi.service;

import cc.genlab.genlablaunchpadlmsapi.model.dto.PaymentDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.RecordPaymentRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.UpdatePaymentRequest;
import cc.genlab.genlablaunchpadlmsapi.model.entity.Enrollment;
import cc.genlab.genlablaunchpadlmsapi.model.entity.Payment;
import cc.genlab.genlablaunchpadlmsapi.model.enums.PaymentMethod;
import cc.genlab.genlablaunchpadlmsapi.model.enums.PaymentStatus;
import cc.genlab.genlablaunchpadlmsapi.repository.EnrollmentRepository;
import cc.genlab.genlablaunchpadlmsapi.repository.PaymentRepository;
import cc.genlab.genlablaunchpadlmsapi.service.port.PaymentServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentService implements PaymentServicePort {

    private final PaymentRepository paymentRepository;
    private final EnrollmentRepository enrollmentRepository;

    // ── Read operations ──────────────────────────────────────────────────

    public List<PaymentDto> getPaymentsByStudentId(UUID studentId) {
        return paymentRepository.findByEnrollmentStudentId(studentId).stream()
                .map(PaymentDto::fromEntity)
                .toList();
    }

    public List<PaymentDto> getEnrollmentPayments(UUID enrollmentId, String userId, String userRole) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment not found"));

        if ("student".equalsIgnoreCase(userRole)) {
            if (!enrollment.getStudent().getId().toString().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied. Enrollment does not belong to this student.");
            }
        }

        return paymentRepository.findByEnrollmentId(enrollmentId).stream()
                .map(PaymentDto::fromEntity)
                .toList();
    }

    public PaymentDto getEnrollmentPaymentDetails(UUID enrollmentId, UUID paymentId, String userId, String userRole) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));

        if (!payment.getEnrollment().getId().equals(enrollmentId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment does not belong to the specified enrollment");
        }

        if ("student".equalsIgnoreCase(userRole)) {
            if (!payment.getEnrollment().getStudent().getId().toString().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied. Payment does not belong to this student.");
            }
        }

        return PaymentDto.fromEntity(payment);
    }

    // ── Admin CRUD operations (moved from AdminService) ──────────────────

    public List<PaymentDto> listAllPayments() {
        return paymentRepository.findAll().stream()
                .map(PaymentDto::fromEntity)
                .toList();
    }

    public List<PaymentDto> getPendingPaymentsSortedByDueDate() {
        return paymentRepository.findByStatusOrderByNextDueDateAsc(PaymentStatus.PENDING).stream()
                .map(PaymentDto::fromEntity)
                .toList();
    }

    public List<PaymentDto> getPaymentsByEnrollmentId(UUID enrollmentId) {
        return paymentRepository.findByEnrollmentId(enrollmentId).stream()
                .map(PaymentDto::fromEntity)
                .toList();
    }

    public PaymentDto getPaymentById(UUID id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
        return PaymentDto.fromEntity(payment);
    }

    @Transactional
    public PaymentDto recordPayment(RecordPaymentRequest request) {
        Enrollment enrollment = enrollmentRepository.findById(request.getEnrollmentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enrollment not found"));

        Payment payment = Payment.builder()
                .enrollment(enrollment)
                .amount(request.getAmount())
                .paymentDate(request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now())
                .nextDueDate(request.getNextDueDate())
                .nextDueAmount(request.getNextDueAmount())
                .paymentMethod(request.getPaymentMethod() != null ? PaymentMethod.fromString(request.getPaymentMethod()) : null)
                .status(request.getStatus() != null ? PaymentStatus.fromString(request.getStatus()) : PaymentStatus.COMPLETED)
                .transactionReference(request.getTransactionReference())
                .notes(request.getNotes())
                .build();

        payment = paymentRepository.save(payment);
        return PaymentDto.fromEntity(payment);
    }

    @Transactional
    public PaymentDto updatePayment(UUID id, UpdatePaymentRequest request) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));

        if (request.getAmount() != null) {
            payment.setAmount(request.getAmount());
        }
        if (request.getPaymentDate() != null) {
            payment.setPaymentDate(request.getPaymentDate());
        }
        if (request.getNextDueDate() != null) {
            payment.setNextDueDate(request.getNextDueDate());
        }
        if (request.getNextDueAmount() != null) {
            payment.setNextDueAmount(request.getNextDueAmount());
        }
        if (request.getPaymentMethod() != null) {
            payment.setPaymentMethod(PaymentMethod.fromString(request.getPaymentMethod()));
        }
        if (request.getStatus() != null) {
            payment.setStatus(PaymentStatus.fromString(request.getStatus()));
        }
        if (request.getTransactionReference() != null) {
            payment.setTransactionReference(request.getTransactionReference());
        }
        if (request.getNotes() != null) {
            payment.setNotes(request.getNotes());
        }

        payment = paymentRepository.save(payment);
        return PaymentDto.fromEntity(payment);
    }

    @Transactional
    public void deletePayment(UUID id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
        paymentRepository.delete(payment);
    }
}
