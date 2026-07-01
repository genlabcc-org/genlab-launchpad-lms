package cc.genlab.genlablaunchpadlmsapi.model.entity;

import cc.genlab.genlablaunchpadlmsapi.model.enums.PaymentMethod;
import cc.genlab.genlablaunchpadlmsapi.model.enums.PaymentStatus;
import cc.genlab.genlablaunchpadlmsapi.model.converter.PaymentMethodConverter;
import cc.genlab.genlablaunchpadlmsapi.model.converter.PaymentStatusConverter;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments_t")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "next_due_date")
    private LocalDate nextDueDate;

    @Column(name = "next_due_amount")
    private BigDecimal nextDueAmount;

    @Column(name = "payment_method")
    @Convert(converter = PaymentMethodConverter.class)
    private PaymentMethod paymentMethod;

    @Column(nullable = false)
    @Convert(converter = PaymentStatusConverter.class)
    private PaymentStatus status;

    @Column(name = "transaction_reference")
    private String transactionReference;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
