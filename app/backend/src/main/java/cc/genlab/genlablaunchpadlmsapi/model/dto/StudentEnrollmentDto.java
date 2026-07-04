package cc.genlab.genlablaunchpadlmsapi.model.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record StudentEnrollmentDto(
    UUID id,
    String status,
    String paymentType,
    BigDecimal totalAmount,
    BigDecimal pendingAmount,
    CourseDto course,
    StudentScheduleDto mentorSchedule,
    List<PaymentDto> payments,
    String certificateUrl,
    String batchId,
    OffsetDateTime createdAt
) {}
