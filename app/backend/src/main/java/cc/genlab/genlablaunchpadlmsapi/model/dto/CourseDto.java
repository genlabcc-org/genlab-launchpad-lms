package cc.genlab.genlablaunchpadlmsapi.model.dto;

import cc.genlab.genlablaunchpadlmsapi.model.entity.Course;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record CourseDto(
    UUID id,
    String title,
    String description,
    BigDecimal price,
    List<MentorDto> mentors,
    List<String> syllabus,
    OffsetDateTime createdAt,
    boolean isActive,
    Integer durationInDays,
    List<Integer> activityMetrics
) {
    public CourseDto(UUID id, String title, String description, java.math.BigDecimal price, List<MentorDto> mentors, OffsetDateTime createdAt) {
        this(id, title, description, price, mentors, List.of(), createdAt, true, 90, List.of());
    }

    public CourseDto(UUID id, String title, String description, BigDecimal price, List<MentorDto> mentors, List<String> syllabus, OffsetDateTime createdAt, boolean isActive, Integer durationInDays) {
        this(id, title, description, price, mentors, syllabus, createdAt, isActive, durationInDays, List.of());
    }

    public static CourseDto fromEntity(Course course) {
        return fromEntity(course, List.of());
    }

    public static CourseDto fromEntity(Course course, List<Integer> activityMetrics) {
        return new CourseDto(
            course.getId(),
            course.getTitle(),
            course.getDescription(),
            course.getPrice(),
            course.getMentors() != null ? course.getMentors().stream().map(MentorDto::fromEntity).toList() : List.of(),
            course.getSyllabus() != null ? course.getSyllabus() : List.of(),
            course.getCreatedAt(),
            course.isActive(),
            course.getDurationInDays(),
            activityMetrics
        );
    }
}
