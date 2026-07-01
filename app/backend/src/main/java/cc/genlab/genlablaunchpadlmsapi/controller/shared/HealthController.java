package cc.genlab.genlablaunchpadlmsapi.controller.shared;

import cc.genlab.genlablaunchpadlmsapi.model.dto.response.MessageResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/health")
    public MessageResponse getHealth() {
        return new MessageResponse("Welcome to GenLab Launchpad LMS");
    }
}
