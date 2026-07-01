package cc.genlab.genlablaunchpadlmsapi.model.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateUserResponse {
    private String userId;
    private String role;
    private String name;
    private String message;
}
