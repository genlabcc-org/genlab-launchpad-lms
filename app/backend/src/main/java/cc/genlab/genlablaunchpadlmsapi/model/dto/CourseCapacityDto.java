package cc.genlab.genlablaunchpadlmsapi.model.dto;

import java.util.List;
import java.util.Map;

public record CourseCapacityDto(
    List<SlotDto> slots,
    List<MentorDto> mentors,
    Map<String, Map<String, Cell>> matrix
) {
    public record Cell(
        int currentEnrollments,
        int maxCapacity,
        boolean isFull
    ) {}
}
