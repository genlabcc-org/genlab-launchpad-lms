package cc.genlab.genlablaunchpadlmsapi.model.dto;

import cc.genlab.genlablaunchpadlmsapi.model.entity.Student;
import java.time.OffsetDateTime;
import java.util.UUID;

public record StudentDto(
    UUID id,
    String name,
    String email,
    OffsetDateTime createdAt
) {
    public static StudentDto fromEntity(Student student) {
        return new StudentDto(
            student.getId(),
            student.getName(),
            student.getEmail(),
            student.getCreatedAt()
        );
    }
}
