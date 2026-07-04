package cc.genlab.genlablaunchpadlmsapi.model.dto;

import cc.genlab.genlablaunchpadlmsapi.model.entity.Batch;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record BatchDto(
    String id,
    String name,
    LocalDate startDate,
    LocalDate cutoffDate,
    OffsetDateTime createdAt
) {
    public static BatchDto fromEntity(Batch batch) {
        if (batch == null) return null;
        return new BatchDto(
            batch.getId(),
            batch.getName(),
            batch.getStartDate(),
            batch.getCutoffDate(),
            batch.getCreatedAt()
        );
    }
}
