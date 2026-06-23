package cc.genlab.genlablaunchpadlmsapi.model.dto;

import cc.genlab.genlablaunchpadlmsapi.model.entity.Course;
import java.time.OffsetDateTime;
import java.util.UUID;

public record CourseDto(
    UUID id,
    String title,
    String description,
    OffsetDateTime createdAt
) {
    public static CourseDto fromEntity(Course course) {
        return new CourseDto(
            course.getId(),
            course.getTitle(),
            course.getDescription(),
            course.getCreatedAt()
        );
    }
}
