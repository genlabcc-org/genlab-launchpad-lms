package cc.genlab.genlablaunchpadlmsapi.controller;

import cc.genlab.genlablaunchpadlmsapi.annotation.RequiresRole;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/mentor")
public class MentorPortalController {

    @GetMapping("/dashboard")
    @RequiresRole("mentor")
    public ResponseEntity<?> dashboard() {
        return ResponseEntity.ok(Map.of("message", "Welcome mentor"));
    }

    @GetMapping("/profile")
    @RequiresRole("mentor")
    public ResponseEntity<?> profile(HttpServletRequest request) {
        return ResponseEntity.ok(Map.of(
                "userId", request.getAttribute("userId"),
                "email", request.getAttribute("email")
        ));
    }
}
