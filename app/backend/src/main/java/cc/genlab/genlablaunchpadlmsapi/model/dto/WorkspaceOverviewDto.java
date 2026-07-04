package cc.genlab.genlablaunchpadlmsapi.model.dto;

public record WorkspaceOverviewDto(
    long slotsCount,
    long coursesCount,
    long mentorsCount,
    long batchesCount,
    long studentsCount
) {}
