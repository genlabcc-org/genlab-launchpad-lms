package cc.genlab.genlablaunchpadlmsapi.model.dto.request;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePaymentRequest {
    private java.math.BigDecimal amount;
    private LocalDate paymentDate;
    private LocalDate nextDueDate;
    private java.math.BigDecimal nextDueAmount;
    private String paymentMethod;
    private String status;
    private String transactionReference;
    private String notes;
}
