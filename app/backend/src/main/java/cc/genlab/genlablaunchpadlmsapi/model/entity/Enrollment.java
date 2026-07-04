package cc.genlab.genlablaunchpadlmsapi.model.entity;

import cc.genlab.genlablaunchpadlmsapi.model.converter.PaymentTypeConverter;
import cc.genlab.genlablaunchpadlmsapi.model.enums.PaymentType;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "enrollments_t")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_schedule_id")
    private MentorSchedule mentorSchedule;

    @Column(name = "payment_type")
    @Convert(converter = PaymentTypeConverter.class)
    private PaymentType paymentType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private Batch batch;

    public String getBatchId() {
        return batch != null ? batch.getId() : null;
    }

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "active";

    @Column(name = "total_amount", nullable = false)
    @Builder.Default
    private java.math.BigDecimal totalAmount = java.math.BigDecimal.ZERO;

    @OneToMany(mappedBy = "enrollment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Payment> payments = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public java.math.BigDecimal getPendingAmount() {
        if (totalAmount == null) return java.math.BigDecimal.ZERO;
        java.math.BigDecimal paid = payments == null ? java.math.BigDecimal.ZERO : payments.stream()
                .filter(java.util.Objects::nonNull)
                .filter(p -> cc.genlab.genlablaunchpadlmsapi.model.enums.PaymentStatus.COMPLETED.equals(p.getStatus()))
                .map(p -> p.getAmount() != null ? p.getAmount() : java.math.BigDecimal.ZERO)
                .reduce(java.math.BigDecimal.ZERO, (a, b) -> a.add(b));
        return totalAmount.subtract(paid);
    }

    @Column(name = "certificate_key")
    private String certificateKey;

    @PrePersist
    protected void onCreate() {
        if (this.totalAmount == null || this.totalAmount.compareTo(java.math.BigDecimal.ZERO) == 0) {
            if (this.mentorSchedule != null && this.mentorSchedule.getCourse() != null) {
                this.totalAmount = this.mentorSchedule.getCourse().getPrice();
            }
        }
    }
}
