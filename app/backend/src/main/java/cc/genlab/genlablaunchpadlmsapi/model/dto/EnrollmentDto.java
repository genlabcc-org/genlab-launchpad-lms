package cc.genlab.genlablaunchpadlmsapi.model.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record EnrollmentDto(
    UUID id,
    StudentDto student,
    StudentScheduleDto mentorSchedule,
    String status,
    String paymentType,
    BigDecimal totalAmount,
    BigDecimal pendingAmount,
    List<PaymentDto> payments,
    String certificateUrl,
    OffsetDateTime createdAt
) {}
