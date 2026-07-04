package cc.genlab.genlablaunchpadlmsapi.model.dto.request;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrollmentRequest {
    private UUID studentId;
    private UUID courseId;
    private UUID mentorId;
    private UUID slotId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String paymentType;
    private BigDecimal totalAmount;
    private String status;
    private String batchId;
}
