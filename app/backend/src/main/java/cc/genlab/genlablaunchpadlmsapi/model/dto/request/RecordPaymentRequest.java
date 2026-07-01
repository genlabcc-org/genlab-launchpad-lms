package cc.genlab.genlablaunchpadlmsapi.model.dto.request;

import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordPaymentRequest {
    private UUID enrollmentId;
    private java.math.BigDecimal amount;
    private LocalDate paymentDate;
    private LocalDate nextDueDate;
    private java.math.BigDecimal nextDueAmount;
    private String paymentMethod;
    private String status;
    private String transactionReference;
    private String notes;
}
