package cc.genlab.genlablaunchpadlmsapi.model.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateMentorRequest {
    private String name;
    private String email;
}
