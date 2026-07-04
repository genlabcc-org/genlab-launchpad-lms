package cc.genlab.genlablaunchpadlmsapi.model.dto.request;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseRequest {
    private String title;
    private String description;
    private BigDecimal price;
    private List<String> syllabus;
    private List<UUID> mentorIds;
    private Boolean isActive;
}
