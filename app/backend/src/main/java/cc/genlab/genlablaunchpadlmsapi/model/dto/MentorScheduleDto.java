package cc.genlab.genlablaunchpadlmsapi.model.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record MentorScheduleDto(
    UUID id,
    SlotDto slot,
    CourseDto course,
    MentorDto mentor,
    LocalDate startDate,
    LocalDate endDate,
    List<StudentDto> students
) {}
