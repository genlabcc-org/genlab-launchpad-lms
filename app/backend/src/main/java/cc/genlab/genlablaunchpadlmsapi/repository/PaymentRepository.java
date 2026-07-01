package cc.genlab.genlablaunchpadlmsapi.repository;

import cc.genlab.genlablaunchpadlmsapi.model.entity.Payment;
import cc.genlab.genlablaunchpadlmsapi.model.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByEnrollmentId(UUID enrollmentId);
    List<Payment> findByEnrollmentStudentId(UUID studentId);
    List<Payment> findByStatusOrderByNextDueDateAsc(PaymentStatus status);
}
