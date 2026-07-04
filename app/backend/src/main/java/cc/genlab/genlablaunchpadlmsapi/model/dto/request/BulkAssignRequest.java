package cc.genlab.genlablaunchpadlmsapi.model.dto.request;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkAssignRequest {
    private List<UUID> studentIds;
    private UUID courseId;
    private UUID mentorId;
    private UUID slotId;
    private String batchId;
}
