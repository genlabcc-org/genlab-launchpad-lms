package cc.genlab.genlablaunchpadlmsapi.model.dto;

import java.time.LocalDate;
import java.util.UUID;

public record StudentScheduleDto(
    UUID id,
    SlotDto slot,
    MentorDto mentor,
    LocalDate startDate,
    LocalDate endDate,
    String batchId
) {}
