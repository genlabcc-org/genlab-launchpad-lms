package cc.genlab.genlablaunchpadlmsapi.model.dto;

import cc.genlab.genlablaunchpadlmsapi.model.entity.Mentor;
import java.util.UUID;

public record MentorDto(
    UUID id,
    String name,
    String email
) {
    public static MentorDto fromEntity(Mentor mentor) {
        if (mentor == null) return null;
        return new MentorDto(
            mentor.getId(),
            mentor.getName(),
            mentor.getEmail()
        );
    }
}
