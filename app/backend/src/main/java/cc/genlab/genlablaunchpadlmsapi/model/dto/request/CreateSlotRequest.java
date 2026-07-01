package cc.genlab.genlablaunchpadlmsapi.model.dto.request;

import lombok.*;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateSlotRequest {
    private LocalTime startTime;
    private LocalTime endTime;
}
