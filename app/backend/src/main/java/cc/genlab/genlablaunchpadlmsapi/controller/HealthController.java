package cc.genlab.genlablaunchpadlmsapi.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String, String> getHealth() {
        return Map.of("message", "Welcome to GenLab Launchpad LMS");
    }
}
